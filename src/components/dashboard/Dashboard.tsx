import { Building2, Users, Target, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCompanies } from '@/data/mockData';
import { StatusBadge } from '@/components/ui/status-badge';

export function Dashboard() {
  const totalCompanies = mockCompanies.length;
  const activeCompanies = mockCompanies.filter(c => c.status === 'ACTIVE').length;
  const prospects = mockCompanies.filter(c => c.status === 'PROSPECT').length;
  const conversionRate = ((activeCompanies / totalCompanies) * 100).toFixed(1);

  const recentCompanies = mockCompanies
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

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
            <div className="space-y-4">
              {recentCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium text-foreground">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated {new Date(company.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={company.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-card">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                mockCompanies.reduce((acc, company) => {
                  acc[company.status] = (acc[company.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status as any} />
                  <span className="font-medium text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}