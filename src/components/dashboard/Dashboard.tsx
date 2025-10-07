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
  const [previousCompanies, setPreviousCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
    loadPreviousWeekCompanies();
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

  const loadPreviousWeekCompanies = async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .lte('created_at', oneWeekAgo.toISOString());

      if (error) throw error;
      setPreviousCompanies(data || []);
    } catch (error) {
      console.error('Error loading previous companies:', error);
    }
  };

  const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: true };
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(percentChange)),
      isPositive: percentChange >= 0
    };
  };

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'COMING').length;
  const prospects = companies.filter(c => c.status === 'TO_CONTACT').length;
  const inDiscussion = companies.filter(c => c.status === 'IN_DISCUSSION').length;
  const contacted = companies.filter(c => c.status === 'CONTACTED').length;
  const conversionRate = totalCompanies > 0 ? ((activeCompanies / totalCompanies) * 100).toFixed(1) : '0';

  // Calculate previous week stats
  const prevTotalCompanies = previousCompanies.length;
  const prevActiveCompanies = previousCompanies.filter(c => c.status === 'COMING').length;
  const prevProspects = previousCompanies.filter(c => c.status === 'TO_CONTACT').length;
  const prevConversionRate = prevTotalCompanies > 0 ? ((prevActiveCompanies / prevTotalCompanies) * 100) : 0;

  // Calculate trends
  const totalTrend = calculateTrend(totalCompanies, prevTotalCompanies);
  const activeTrend = calculateTrend(activeCompanies, prevActiveCompanies);
  const prospectsTrend = calculateTrend(prospects, prevProspects);
  const conversionTrend = calculateTrend(parseFloat(conversionRate), prevConversionRate);

  // Data for charts
  const statusDistribution = [
    { 
      name: 'A démarcher', 
      value: prospects, 
      color: 'hsl(210, 100%, 50%)',
      label: 'A démarcher'
    },
    { 
      name: 'Vient', 
      value: activeCompanies, 
      color: 'hsl(142, 71%, 45%)',
      label: 'Vient'
    },
    { 
      name: 'En discussion', 
      value: inDiscussion, 
      color: 'hsl(45, 100%, 50%)',
      label: 'En discussion'
    },
    { 
      name: 'Contacté', 
      value: contacted, 
      color: 'hsl(260, 100%, 50%)',
      label: 'Contacté'
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
      toContact: dayCompanies.filter(c => c.status === 'TO_CONTACT').length,
      coming: dayCompanies.filter(c => c.status === 'COMING').length
    };
  });

  const chartConfig = {
    toContact: { label: 'A démarcher', color: 'hsl(210, 100%, 50%)' },
    coming: { label: 'Vient', color: 'hsl(142, 71%, 45%)' },
    inDiscussion: { label: 'En discussion', color: 'hsl(45, 100%, 50%)' },
    contacted: { label: 'Contacté', color: 'hsl(260, 100%, 50%)' }
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
          trend={totalTrend}
        />
        <StatsCard
          title="Vient"
          value={activeCompanies}
          description="Entreprises confirmées"
          icon={Users}
          trend={activeTrend}
        />
        <StatsCard
          title="A démarcher"
          value={prospects}
          description="Nouveaux clients potentiels"
          icon={Target}
          trend={prospectsTrend}
        />
        <StatsCard
          title="Taux de Conversion"
          value={`${conversionRate}%`}
          description="Ratio vers confirmation"
          icon={TrendingUp}
          trend={conversionTrend}
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
                  <Bar dataKey="toContact" fill="var(--color-toContact)" name="A démarcher" />
                  <Bar dataKey="coming" fill="var(--color-coming)" name="Vient" />
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