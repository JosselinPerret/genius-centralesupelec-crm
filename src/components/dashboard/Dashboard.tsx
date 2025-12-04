import { useState, useEffect } from 'react';
import { Building2, Users, Target, TrendingUp, Sparkles, ArrowRight, Calendar, Activity } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/crm';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
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

  const recentCompanies = companies.slice(0, 5);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* Header with welcome message */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tableau de bord</h1>
            <Sparkles className="h-6 w-6 text-primary animate-pulse-soft" />
          </div>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre activité commerciale
          </p>
        </div>
        <Button 
          onClick={() => navigate('/?tab=companies')}
          className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
        >
          Voir les entreprises
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stats Grid - Responsive with animations */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in stagger-1">
          <StatsCard
            title="Total Entreprises"
            value={totalCompanies}
            description="Toutes les entreprises"
            icon={Building2}
            trend={totalTrend}
            variant="default"
          />
        </div>
        <div className="animate-fade-in stagger-2">
          <StatsCard
            title="Confirmées"
            value={activeCompanies}
            description="Entreprises qui viennent"
            icon={Users}
            trend={activeTrend}
            variant="success"
          />
        </div>
        <div className="animate-fade-in stagger-3">
          <StatsCard
            title="À démarcher"
            value={prospects}
            description="Prospects à contacter"
            icon={Target}
            trend={prospectsTrend}
            variant="warning"
          />
        </div>
        <div className="animate-fade-in stagger-4">
          <StatsCard
            title="Taux de conversion"
            value={`${conversionRate}%`}
            description="Ratio de confirmation"
            icon={TrendingUp}
            trend={conversionTrend}
            variant="info"
          />
        </div>
      </div>

      {/* Charts Section - Modern design */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in stagger-5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Répartition des statuts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Pie
                      data={statusDistribution.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="75%"
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={2}
                      label={({ value }) => value > 0 ? value : ''}
                      labelLine={false}
                    >
                      {statusDistribution.filter(item => item.value > 0).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in stagger-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-info/10">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <CardTitle className="text-lg">Activité des 7 derniers jours</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                      width={30}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                    />
                    <Bar dataKey="contacted" fill="hsl(260, 60%, 55%)" name="Contacté" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inDiscussion" fill="hsl(45, 90%, 50%)" name="En discussion" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="coming" fill="hsl(155, 75%, 45%)" name="Vient" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="notComing" fill="hsl(0, 75%, 55%)" name="Ne vient pas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nextYear" fill="hsl(205, 85%, 55%)" name="Année prochaine" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Status Distribution */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Activité récente</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80"
                onClick={() => navigate('/?tab=companies')}
              >
                Tout voir
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            ) : recentCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCompanies.map((company, index) => (
                  <div 
                    key={company.id} 
                    className="group flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Modifié le {new Date(company.updated_at).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={company.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Légende des statuts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {statusDistribution.filter(s => s.value > 0).map((status) => (
                  <div 
                    key={status.name} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-background" 
                        style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}` }}
                      />
                      <span className="text-sm text-foreground">{status.name}</span>
                    </div>
                    <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md text-sm">
                      {status.value}
                    </span>
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