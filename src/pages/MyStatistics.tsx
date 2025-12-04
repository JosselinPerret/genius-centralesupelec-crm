import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Target, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/status-badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface Company {
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

export default function MyStatistics() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyStatistics();
    }
  }, [user]);

  const loadMyStatistics = async () => {
    setIsLoading(true);
    try {
      // Get assignments for current user
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('company_id')
        .eq('user_id', user!.id);

      if (assignmentsError) throw assignmentsError;

      const companyIds = assignments?.map(a => a.company_id) || [];

      if (companyIds.length > 0) {
        // Get companies assigned to current user
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
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAssigned = companies.length;
  const coming = companies.filter(c => c.status === 'COMING').length;
  const toContact = companies.filter(c => c.status === 'TO_CONTACT').length;
  const inDiscussion = companies.filter(c => c.status === 'IN_DISCUSSION').length;
  const contacted = companies.filter(c => c.status === 'CONTACTED').length;
  const conversionRate = totalAssigned > 0 ? ((coming / totalAssigned) * 100).toFixed(1) : '0';

  const allStatuses = {
    'NOT_TO_CONTACT': { name: 'Ne pas contacter', color: 'hsl(0, 0%, 50%)' },
    'TO_CONTACT': { name: 'A démarcher', color: 'hsl(210, 100%, 50%)' },
    'CONTACTED': { name: 'Contacté', color: 'hsl(260, 60%, 50%)' },
    'FIRST_FOLLOWUP': { name: '1ère relance', color: 'hsl(280, 60%, 50%)' },
    'SECOND_FOLLOWUP': { name: '2ème relance', color: 'hsl(300, 60%, 50%)' },
    'THIRD_FOLLOWUP': { name: '3ème relance', color: 'hsl(320, 60%, 50%)' },
    'IN_DISCUSSION': { name: 'En discussion', color: 'hsl(45, 100%, 50%)' },
    'COMING': { name: 'Vient', color: 'hsl(142, 71%, 45%)' },
    'NOT_COMING': { name: 'Ne vient pas', color: 'hsl(0, 71%, 50%)' },
    'NEXT_YEAR': { name: 'Année prochaine', color: 'hsl(200, 60%, 50%)' }
  };

  const statusDistribution = Object.entries(allStatuses).map(([status, info]) => ({
    name: info.name,
    value: companies.filter(c => c.status === status).length,
    color: info.color,
    label: info.name
  }));

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mes Statistiques</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {profile?.name} - {profile?.role}
            </p>
          </div>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Mes Assignations"
          value={totalAssigned}
          description="Entreprises assignées"
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Répartition des Statuts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
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
                      dataKey="value"
                      nameKey="name"
                      label={({ value }) => `${value}`}
                    >
                      {statusDistribution.filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {companies.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Détail des Statuts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {statusDistribution.map((status) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-foreground">{status.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{status.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Mes Entreprises</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : companies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Vous n'avez pas encore d'entreprises assignées.
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
    </div>
    </MainLayout>
  );
}
