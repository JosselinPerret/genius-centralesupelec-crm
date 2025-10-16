import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { UserRanking } from '@/components/dashboard/UserRanking';
import { ScoringReference } from '@/components/dashboard/ScoringReference';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refresh data each time this page is visited
  useEffect(() => {
    // Force a refresh by incrementing the trigger
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleRefresh = () => {
    // Manually refresh by incrementing trigger
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
            <Button
              variant="ghost"
              onClick={() => navigate('/?tab=dashboard')}
              className="shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Retour</span>
            </Button>
            <div className="flex items-center space-x-2 md:space-x-3">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 flex-shrink-0" />
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">Classement</h1>
            </div>
          </div>
          
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            Actualiser
          </Button>
        </div>

        {/* Info Card */}
        <Card className="shadow-card bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">📊 Tableau des Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-muted-foreground">
              Les classements se mettent à jour chaque fois que vous visitez cette page. 
              Consultez les scores des utilisateurs et des entreprises en temps réel.
            </p>
          </CardContent>
        </Card>

        {/* Rankings Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Ranking */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <span>👥</span> Utilisateurs
            </h2>
            <UserRanking key={`user-ranking-${refreshTrigger}`} />
          </div>

          {/* Company Ranking */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <span>🏢</span> Classement Entreprises
            </h2>
            <ScoringReference key={`company-ranking-${refreshTrigger}`} />
          </div>
        </div>

        {/* Legend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Système de Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Points utilisateurs:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Vient: <span className="font-semibold text-green-600">+5 points</span></li>
                  <li>🤝 En discussion: <span className="font-semibold text-blue-600">+3 points</span></li>
                  <li>📞 Contacté: <span className="font-semibold text-purple-600">+1 point</span></li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Points entreprises:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Vient: <span className="font-semibold text-green-600">Priorité 1</span></li>
                  <li>🤝 En discussion: <span className="font-semibold text-blue-600">Priorité 2</span></li>
                  <li>📞 Contacté: <span className="font-semibold text-purple-600">Priorité 3</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
