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

  // Data for charts - Show ALL statuses
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
      contacted: dayCompanies.filter(c => c.status === 'CONTACTED').length,
      inDiscussion: dayCompanies.filter(c => c.status === 'IN_DISCUSSION').length,
      coming: dayCompanies.filter(c => c.status === 'COMING').length,
      notComing: dayCompanies.filter(c => c.status === 'NOT_COMING').length,
      nextYear: dayCompanies.filter(c => c.status === 'NEXT_YEAR').length
    };
  });

  const chartConfig = {
    contacted: { label: 'Contacté', color: 'hsl(260, 60%, 50%)' },
    inDiscussion: { label: 'En discussion', color: 'hsl(45, 100%, 50%)' },
    coming: { label: 'Vient', color: 'hsl(142, 71%, 45%)' },
    notComing: { label: 'Ne vient pas', color: 'hsl(0, 71%, 50%)' },
    nextYear: { label: 'Année prochaine', color: 'hsl(200, 60%, 50%)' }
  };

  const recentCompanies = companies.slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tableau de bord</h1>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Charts Section - Responsive */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-card w-full overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Répartition des Statuts</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="w-full h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={statusDistribution.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      dataKey="value"
                      label={({ name, value }) => `${value}`}
                      labelLine={false}
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

        <Card className="shadow-card w-full overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Activité des 7 Derniers Jours</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="w-full h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={35} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="contacted" fill="hsl(260, 60%, 50%)" name="Contacté" />
                    <Bar dataKey="inDiscussion" fill="hsl(45, 100%, 50%)" name="En discussion" />
                    <Bar dataKey="coming" fill="hsl(142, 71%, 45%)" name="Vient" />
                    <Bar dataKey="notComing" fill="hsl(0, 71%, 50%)" name="Ne vient pas" />
                    <Bar dataKey="nextYear" fill="hsl(200, 60%, 50%)" name="Année prochaine" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Status Distribution */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 shadow-card w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2 md:space-y-4">
                {recentCompanies.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucune activité récente</p>
                ) : (
                  recentCompanies.map((company) => (
                    <div key={company.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 last:border-0 gap-2">
                      <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm md:text-base truncate">{company.name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
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

        <Card className="col-span-1 lg:col-span-3 shadow-card w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Distribution des Statuts</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {statusDistribution.map((status) => (
                  <div key={status.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-xs md:text-sm text-foreground truncate">{status.name}</span>
                    </div>
                    <span className="font-medium text-foreground text-sm md:text-base flex-shrink-0">{status.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}