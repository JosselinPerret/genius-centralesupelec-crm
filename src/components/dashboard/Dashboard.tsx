import { useState, useEffect } from 'react';
import { Building2, Users, Target, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/crm';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

export function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'EN_COURS').length;
  const prospects = companies.filter(c => c.status === 'PROSPECT').length;
  const refusedCompanies = companies.filter(c => c.status === 'REFUSE').length;
  const relanceCompanies = companies.filter(c => c.status === 'RELANCE').length;
  const conversionRate = totalCompanies > 0 ? ((activeCompanies / totalCompanies) * 100).toFixed(1) : '0';

  // Data for charts
  const statusDistribution = [
    { 
      name: 'Prospect', 
      value: prospects, 
      color: 'hsl(210, 100%, 50%)',
      label: 'Prospects'
    },
    { 
      name: 'En cours', 
      value: activeCompanies, 
      color: 'hsl(25, 100%, 50%)',
      label: 'En cours de discussion'
    },
    { 
      name: 'Refusé', 
      value: refusedCompanies, 
      color: 'hsl(0, 84%, 60%)',
      label: 'Refusé'
    },
    { 
      name: 'Relance', 
      value: relanceCompanies, 
      color: 'hsl(45, 100%, 50%)',
      label: 'Relance'
    }
  ].filter(item => item.value > 0);

  // Activity data (last 7 days)
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayCompanies = companies.filter(c => {
      const companyDate = new Date(c.updated_at);
      return companyDate.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      companies: dayCompanies.length,
      prospects: dayCompanies.filter(c => c.status === 'PROSPECT').length,
      enCours: dayCompanies.filter(c => c.status === 'EN_COURS').length
    };
  });

  const chartConfig = {
    prospects: { label: 'Prospects', color: 'hsl(210, 100%, 50%)' },
    enCours: { label: 'En cours', color: 'hsl(25, 100%, 50%)' },
    refuse: { label: 'Refusé', color: 'hsl(0, 84%, 60%)' },
    relance: { label: 'Relance', color: 'hsl(45, 100%, 50%)' }
  };

  const recentCompanies = companies.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Entreprises"
          value={totalCompanies}
          description="Toutes les entreprises enregistrées"
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="En Cours"
          value={activeCompanies}
          description="Discussions en cours"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Prospects"
          value={prospects}
          description="Nouveaux clients potentiels"
          icon={Target}
          trend={{ value: -2, isPositive: false }}
        />
        <StatsCard
          title="Taux de Conversion"
          value={`${conversionRate}%`}
          description="Ratio prospect vers actif"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
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
            <CardTitle>Activité des 7 Derniers Jours</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="prospects" fill="var(--color-prospects)" name="Prospects" />
                  <Bar dataKey="enCours" fill="var(--color-enCours)" name="En cours" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-card">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {recentCompanies.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucune activité récente</p>
                ) : (
                  recentCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium text-foreground">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Modifié le {new Date(company.updated_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={company.status} />
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-card">
          <CardHeader>
            <CardTitle>Distribution des Statuts</CardTitle>
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
                  <p className="text-muted-foreground text-sm">Aucune entreprise pour le moment</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}