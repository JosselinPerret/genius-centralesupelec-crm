import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { UserRanking } from '@/components/dashboard/UserRanking';
import { CompanyRanking } from '@/components/dashboard/CompanyRanking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data when component mounts or when user navigates to this page
  useEffect(() => {
    // Increment the refresh key to force re-render of child components
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Retour</span>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Classement</h1>
          </div>
          
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            Actualiser
          </Button>
        </div>

        {/* Description Card */}
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm md:text-base text-foreground">
              Consultez les classements des utilisateurs et des entreprises en temps réel. 
              Les données se mettent à jour automatiquement à chaque visite.
            </p>
          </CardContent>
        </Card>

        {/* User Ranking */}
        <div key={`user-${refreshKey}`}>
          <UserRanking />
        </div>

        {/* Company Ranking */}
        <div key={`company-${refreshKey}`}>
          <CompanyRanking />
        </div>
      </div>
    </MainLayout>
  );
}
