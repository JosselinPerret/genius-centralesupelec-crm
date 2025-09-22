import { useState, useEffect } from 'react';
import { Building2, Users, Target, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/crm';

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
  const activeCompanies = companies.filter(c => c.status === 'ACTIVE').length;
  const prospects = companies.filter(c => c.status === 'PROSPECT').length;
  const conversionRate = totalCompanies > 0 ? ((activeCompanies / totalCompanies) * 100).toFixed(1) : '0';

  const recentCompanies = companies.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Companies"
          value={totalCompanies}
          description="All registered companies"
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Companies"
          value={activeCompanies}
          description="Currently active clients"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Prospects"
          value={prospects}
          description="Potential new clients"
          icon={Target}
          trend={{ value: -2, isPositive: false }}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          description="Prospect to active ratio"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {recentCompanies.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                ) : (
                  recentCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium text-foreground">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Updated {new Date(company.updated_at).toLocaleDateString()}
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
            <CardTitle>Status Distribution</CardTitle>
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
                  <p className="text-muted-foreground text-sm">No companies yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}