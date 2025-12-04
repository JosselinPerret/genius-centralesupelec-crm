import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, Target, TrendingUp, Users, ArrowLeft, Trash2 } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

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
  updated_at: string;
}

export default function UserStatistics() {
  const { userId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(userId || '');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const canAccess = profile?.role === 'ADMIN' || profile?.role === 'MANAGER';

  useEffect(() => {
    if (canAccess) {
      loadUsers();
    }
  }, [canAccess]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserStatistics(selectedUserId);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
      
      if (data && data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].user_id);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserStatistics = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setSelectedUser(profileData);

      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('company_id')
        .eq('user_id', userId);

      if (assignmentsError) throw assignmentsError;

      const companyIds = assignments?.map(a => a.company_id) || [];

      if (companyIds.length > 0) {
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .in('id', companyIds)
          .order('updated_at', { ascending: false });

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error loading user statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUserId || selectedUserId === profile?.user_id) return;
    
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://gzapjsbpymfmliurdqen.supabase.co/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId: selectedUserId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      
      await loadUsers();
      setSelectedUser(null);
      setCompanies([]);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin = profile?.role === 'ADMIN';
  const canDeleteSelectedUser = isAdmin && selectedUserId && selectedUserId !== profile?.user_id;

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  const totalAssigned = companies.length;
  const coming = companies.filter(c => c.status === 'COMING').length;
  const toContact = companies.filter(c => c.status === 'TO_CONTACT').length;
  const inDiscussion = companies.filter(c => c.status === 'IN_DISCUSSION').length;
  const conversionRate = totalAssigned > 0 ? ((coming / totalAssigned) * 100).toFixed(1) : '0';

  const allStatuses = {
    'NOT_TO_CONTACT': { name: 'Ne pas contacter', color: 'hsl(220, 15%, 55%)' },
    'TO_CONTACT': { name: 'A démarcher', color: 'hsl(230, 80%, 60%)' },
    'CONTACTED': { name: 'Contacté', color: 'hsl(260, 70%, 55%)' },
    'FIRST_FOLLOWUP': { name: '1ère relance', color: 'hsl(280, 65%, 55%)' },
    'SECOND_FOLLOWUP': { name: '2ème relance', color: 'hsl(300, 60%, 55%)' },
    'THIRD_FOLLOWUP': { name: '3ème relance', color: 'hsl(320, 65%, 55%)' },
    'IN_DISCUSSION': { name: 'En discussion', color: 'hsl(38, 90%, 55%)' },
    'COMING': { name: 'Vient', color: 'hsl(150, 70%, 45%)' },
    'NOT_COMING': { name: 'Ne vient pas', color: 'hsl(0, 75%, 55%)' },
    'NEXT_YEAR': { name: 'Année prochaine', color: 'hsl(200, 70%, 55%)' }
  };

  const statusDistribution = Object.entries(allStatuses).map(([status, info]) => ({
    name: info.name,
    value: companies.filter(c => c.status === status).length,
    color: info.color,
    label: info.name
  }));

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="w-fit gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Statistiques Utilisateur
            </h1>
            <p className="text-muted-foreground mt-1">
              Consultez les performances et activités des utilisateurs
            </p>
          </div>
        </div>

        {/* User Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sélectionner un utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choisir un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                        <span className="text-muted-foreground">• {user.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {canDeleteSelectedUser && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={isDeleting} className="shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-strong">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer <strong>{selectedUser?.name}</strong> ? 
                        Cette action est irréversible et supprimera toutes les données associées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteUser}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedUser && (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Entreprises Assignées"
                value={totalAssigned}
                description="Total des assignations"
                icon={Building2}
              />
              <StatsCard
                title="Vient"
                value={coming}
                description="Entreprises confirmées"
                icon={Users}
              />
              <StatsCard
                title="A Démarcher"
                value={toContact}
                description="En attente de contact"
                icon={Target}
              />
              <StatsCard
                title="Taux de Conversion"
                value={`${conversionRate}%`}
                description="Ratio de succès"
                icon={TrendingUp}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Répartition des Statuts</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : companies.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-12">
                      Aucune donnée disponible
                    </p>
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip 
                            formatter={(value: number, name: string) => [value, name]}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Pie
                            data={statusDistribution.filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            outerRadius="70%"
                            innerRadius="35%"
                            dataKey="value"
                            nameKey="name"
                            strokeWidth={2}
                            stroke="hsl(var(--background))"
                          >
                            {statusDistribution.filter(item => item.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détail des Statuts</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                      {statusDistribution.map((status) => (
                        <div 
                          key={status.name} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: status.color }}
                            />
                            <span className="text-sm font-medium text-foreground">{status.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground bg-background/50 px-2.5 py-1 rounded-md">
                            {status.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Companies List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Entreprises Assignées</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      Aucune entreprise assignée à cet utilisateur.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {companies.map((company, index) => (
                      <Link
                        key={company.id}
                        to={`/company/${company.id}`}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/50 transition-all duration-200 group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center group-hover:bg-gradient-primary/20 transition-colors">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {company.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Modifié le {new Date(company.updated_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={company.status as any} />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}