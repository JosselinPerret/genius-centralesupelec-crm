import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Target, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatusBadge } from '@/components/ui/status-badge';

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
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(userId || '');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Only admin and manager can access this page
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
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setSelectedUser(profileData);

      // Get assignments for this user
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('company_id')
        .eq('user_id', userId);

      if (assignmentsError) throw assignmentsError;

      const companyIds = assignments?.map(a => a.company_id) || [];

      if (companyIds.length > 0) {
        // Get companies assigned to this user
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

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  const totalAssigned = companies.length;
  const coming = companies.filter(c => c.status === 'COMING').length;
  const toContact = companies.filter(c => c.status === 'TO_CONTACT').length;
  const inDiscussion = companies.filter(c => c.status === 'IN_DISCUSSION').length;
  const conversionRate = totalAssigned > 0 ? ((coming / totalAssigned) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Statistiques Utilisateur</h1>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Sélectionner un utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir un utilisateur" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.name} - {user.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Entreprises Assignées</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : companies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune entreprise assignée à cet utilisateur.
                </p>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0 hover:bg-accent/50 transition-colors p-2 rounded -m-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Modifié le {new Date(company.updated_at).toLocaleDateString('fr-FR')}
                        </p>
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
  );
}
