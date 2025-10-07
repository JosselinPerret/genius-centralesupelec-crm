import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Building2, User, Search, Eye, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { Assignment, Company } from '@/types/crm';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: string;
}

export function AssignmentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchCurrentUserRole();
      fetchAssignments();
      fetchCompanies();
      fetchUsers();
    }
  }, [user]);

  const fetchCurrentUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCurrentUserRole(data?.role || 'VOLUNTEER');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setCurrentUserRole('VOLUNTEER');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur",
        description: "Échec du chargement des utilisateurs",
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          profiles:user_id (
            id,
            user_id,
            name,
            role,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Erreur",
        description: "Échec du chargement des affectations",
        variant: "destructive",
      });
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
      
      // Filter companies that are not already assigned to the current user
      const { data: assignedCompanies } = await supabase
        .from('assignments')
        .select('company_id')
        .eq('user_id', user?.id);

      const assignedCompanyIds = assignedCompanies?.map(a => a.company_id) || [];
      const available = (data || []).filter(company => !assignedCompanyIds.includes(company.id));
      setAvailableCompanies(available);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erreur",
        description: "Échec du chargement des entreprises",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToCompany = async () => {
    if (!selectedCompany || !user) return;

    const isAdminOrManager = currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER';
    const targetUserId = isAdminOrManager && selectedUser ? selectedUser : user.id;

    if (isAdminOrManager && !selectedUser) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          company_id: selectedCompany,
          user_id: targetUserId,
          role: 'CONTACT',
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Affectation à l'entreprise réussie",
      });

      setSelectedCompany('');
      setSelectedUser('');
      fetchAssignments();
      fetchCompanies();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Erreur",
        description: "Échec de la création de l'affectation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Affectation supprimée avec succès",
      });

      fetchAssignments();
      fetchCompanies(); // Refresh to update available companies
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'affectation",
        variant: "destructive",
      });
    }
  };

  const getCompanyDetails = (companyId: string) => {
    return companies.find(c => c.id === companyId);
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Unknown Company';
  };

  const getCompanyStatus = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.status || 'UNKNOWN';
  };

  const handleViewCompany = (companyId: string) => {
    const company = getCompanyDetails(companyId);
    if (company) {
      setViewingCompany(company);
    }
  };

  const handleEditCompany = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  const filteredAvailableCompanies = availableCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes affectations</h1>
          <p className="text-muted-foreground">
            Gérez vos affectations d'entreprises et vos rôles
          </p>
        </div>
      </div>

      {/* Add New Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Affecter à une entreprise
          </CardTitle>
          <CardDescription>
            Choisissez une entreprise et votre rôle pour créer une nouvelle affectation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des entreprises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Entreprise</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une entreprise" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailableCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{company.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER') && (
              <div>
                <label className="text-sm font-medium mb-2 block">Utilisateur</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{profile.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button 
                onClick={handleAssignToCompany}
                disabled={!selectedCompany || ((currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER') && !selectedUser)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une affectation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Affectations actuelles ({assignments.length})
          </CardTitle>
          <CardDescription>
            Vos affectations d'entreprises et rôles actuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucune affectation</h3>
              <p className="text-muted-foreground">
                Vous n'avez encore été affecté à aucune entreprise. Utilisez le formulaire ci-dessus pour vous affecter à une entreprise.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const company = getCompanyDetails(assignment.company_id);
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {getCompanyName(assignment.company_id)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {assignment.role}
                          </Badge>
                          <Badge variant="outline">
                            {getCompanyStatus(assignment.company_id)}
                          </Badge>
                        </div>
                        {company && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {company.contact_name && (
                              <span>{company.contact_name}</span>
                            )}
                            {company.contact_email && (
                              <span className="ml-2">• {company.contact_email}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Depuis le {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCompany(assignment.company_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompany(assignment.company_id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'affectation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer votre affectation de "{getCompanyName(assignment.company_id)}" ? 
                              Cette action ne peut pas être annulée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveAssignment(assignment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredAvailableCompanies.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune entreprise trouvée</h3>
            <p className="text-muted-foreground">
              Aucune entreprise ne correspond à vos critères de recherche. Essayez un autre terme de recherche.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Company Information Dialog */}
      <Dialog open={!!viewingCompany} onOpenChange={() => setViewingCompany(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {viewingCompany?.name}
            </DialogTitle>
            <DialogDescription>
              Détails et informations de l'entreprise
            </DialogDescription>
          </DialogHeader>
          
          {viewingCompany && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Statut</h4>
                    <StatusBadge status={viewingCompany.status} />
                  </div>
                  
                  {viewingCompany.contact_name && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Personne de contact</h4>
                      <p className="text-foreground">{viewingCompany.contact_name}</p>
                    </div>
                  )}
                  
                  {viewingCompany.contact_email && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Email</h4>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-foreground">{viewingCompany.contact_email}</p>
                      </div>
                    </div>
                  )}
                  
                  {viewingCompany.phone && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Téléphone</h4>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-foreground">{viewingCompany.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {(viewingCompany.booth_number || viewingCompany.booth_location) && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Informations du stand</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {viewingCompany.booth_number && (
                            <p className="text-foreground">Stand {viewingCompany.booth_number}</p>
                          )}
                          {viewingCompany.booth_location && (
                            <p className="text-muted-foreground">{viewingCompany.booth_location}</p>
                          )}
                          {viewingCompany.booth_size && (
                            <p className="text-muted-foreground">Taille : {viewingCompany.booth_size}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Créé le</h4>
                    <p className="text-muted-foreground">
                      {new Date(viewingCompany.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Dernière mise à jour</h4>
                    <p className="text-muted-foreground">
                      {new Date(viewingCompany.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewingCompany(null)}>
                  Fermer
                </Button>
                <Button onClick={() => {
                  setViewingCompany(null);
                  handleEditCompany(viewingCompany.id);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier l'entreprise
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
