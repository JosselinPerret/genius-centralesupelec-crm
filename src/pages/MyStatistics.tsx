import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Target, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  PieChart, 
  Pie, 
  Cell 
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

  const statusDistribution = [
    { 
      name: 'A démarcher', 
      value: toContact, 
      color: 'hsl(210, 100%, 50%)'
    },
    { 
      name: 'Vient', 
      value: coming, 
      color: 'hsl(142, 71%, 45%)'
    },
    { 
      name: 'En discussion', 
      value: inDiscussion, 
      color: 'hsl(45, 100%, 50%)'
    },
    { 
      name: 'Contacté', 
      value: contacted, 
      color: 'hsl(260, 100%, 50%)'
    }
  ].filter(item => item.value > 0);

  const chartConfig = {
    toContact: { label: 'A démarcher', color: 'hsl(210, 100%, 50%)' },
    coming: { label: 'Vient', color: 'hsl(142, 71%, 45%)' },
    inDiscussion: { label: 'En discussion', color: 'hsl(45, 100%, 50%)' },
    contacted: { label: 'Contacté', color: 'hsl(260, 100%, 50%)' }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Mes Statistiques</h1>
          <p className="text-muted-foreground mt-1">
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
            ) : statusDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
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
                {Object.entries(
                  companies.reduce((acc, company) => {
                    acc[company.status] = (acc[company.status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge status={status as any} />
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                ))}
                {companies.length === 0 && (
                  <p className="text-muted-foreground text-sm">Aucune entreprise assignée</p>
                )}
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
  );
}
