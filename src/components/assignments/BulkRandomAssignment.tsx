import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Building2, Shuffle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: string;
}

interface Company {
  id: string;
  name: string;
  status: string;
}

export function BulkRandomAssignment() {
  const { toast } = useToast();
  
  const [users, setUsers] = useState<Profile[]>([]);
  const [unassignedCompanies, setUnassignedCompanies] = useState<Company[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [companiesPerUser, setCompaniesPerUser] = useState<string>('10');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch unassigned companies
      const { data: assignedCompaniesData } = await supabase
        .from('assignments')
        .select('company_id');

      const assignedIds = new Set(assignedCompaniesData?.map(a => a.company_id) || []);

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) throw companiesError;

      const unassigned = (companiesData || []).filter(c => !assignedIds.has(c.id));
      setUnassignedCompanies(unassigned);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setSelectedUsers(new Set(users.map(u => u.user_id)));
      setSelectAll(true);
    }
  };

  const performBulkAssignment = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un utilisateur",
        variant: "destructive",
      });
      return;
    }

    const companiesPerUserNum = parseInt(companiesPerUser);
    const selectedUserArray = Array.from(selectedUsers);
    const totalNeeded = companiesPerUserNum * selectedUserArray.length;

    if (totalNeeded > unassignedCompanies.length) {
      toast({
        title: "Erreur",
        description: `Vous avez besoin de ${totalNeeded} entreprises non assignées, mais seulement ${unassignedCompanies.length} sont disponibles.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Shuffle companies randomly
      const shuffled = [...unassignedCompanies].sort(() => Math.random() - 0.5);

      // Create assignments
      const assignments = [];
      for (let i = 0; i < companiesPerUserNum; i++) {
        for (let j = 0; j < selectedUserArray.length; j++) {
          const companyIndex = i * selectedUserArray.length + j;
          if (companyIndex < shuffled.length) {
            assignments.push({
              company_id: shuffled[companyIndex].id,
              user_id: selectedUserArray[j],
              role: 'CONTACT',
            });
          }
        }
      }

      // Insert all assignments
      const { error } = await supabase
        .from('assignments')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${assignments.length} affectations créées avec succès. Chaque utilisateur sélectionné a reçu ${companiesPerUserNum} entreprises.`,
      });

      // Reset form
      setSelectedUsers(new Set());
      setSelectAll(false);
      setCompaniesPerUser('10');

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error performing bulk assignment:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création des affectations",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Affectation Aléatoire en Masse
        </CardTitle>
        <CardDescription>
          Affectez automatiquement des entreprises non assignées à plusieurs utilisateurs de manière aléatoire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Utilisateurs Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Entreprises Non Assignées</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{unassignedCompanies.length}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shuffle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Affectations à Créer</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {selectedUsers.size * parseInt(companiesPerUser || '0')}
            </p>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Entreprises par utilisateur</label>
              <Input
                type="number"
                min="1"
                value={companiesPerUser}
                onChange={(e) => setCompaniesPerUser(e.target.value)}
                placeholder="10"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nombre d'entreprises à affecter à chaque utilisateur sélectionné
              </p>
            </div>
          </div>
        </div>

        {/* Users Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sélectionner les utilisateurs</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={isProcessing || users.length === 0}
            >
              {selectAll ? 'Désélectionner tout' : 'Sélectionner tout'}
            </Button>
          </div>

          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun utilisateur trouvé</p>
            ) : (
              users.map((user) => (
                <div key={user.user_id} className="flex items-center gap-3">
                  <Checkbox
                    id={`user-${user.user_id}`}
                    checked={selectedUsers.has(user.user_id)}
                    onCheckedChange={() => handleUserToggle(user.user_id)}
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor={`user-${user.user_id}`}
                    className="flex-1 cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warning Messages */}
        {selectedUsers.size > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Résumé :</strong> {selectedUsers.size} utilisateur(s) recevront {parseInt(companiesPerUser)} entreprise(s) chacun 
              = {selectedUsers.size * parseInt(companiesPerUser)} affectations au total
              {selectedUsers.size * parseInt(companiesPerUser) > unassignedCompanies.length && (
                <span className="block mt-2 text-red-600 dark:text-red-400">
                  ⚠️ Insuffisant ! Seulement {unassignedCompanies.length} entreprises disponibles
                </span>
              )}
            </p>
          </div>
        )}

        {/* Action Button */}
        {unassignedCompanies.length === 0 ? (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Aucune entreprise non assignée disponible
            </p>
          </div>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={selectedUsers.size === 0 || isProcessing || selectedUsers.size * parseInt(companiesPerUser) > unassignedCompanies.length}
                className="w-full"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Créer les affectations aléatoires
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l'affectation aléatoire</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous êtes sur le point de créer {selectedUsers.size * parseInt(companiesPerUser)} affectations.
                  <br />
                  <br />
                  <strong>Résumé :</strong>
                  <br />
                  • Utilisateurs : {selectedUsers.size}
                  <br />
                  • Entreprises par utilisateur : {companiesPerUser}
                  <br />
                  • Total affectations : {selectedUsers.size * parseInt(companiesPerUser)}
                  <br />
                  <br />
                  Les entreprises seront distribuées aléatoirement et de manière équitable entre les utilisateurs sélectionnés.
                  Cette action ne peut pas être annulée facilement. Êtes-vous sûr ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={performBulkAssignment}
                  disabled={isProcessing}
                  className="bg-primary"
                >
                  {isProcessing ? 'Traitement...' : 'Confirmer'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
