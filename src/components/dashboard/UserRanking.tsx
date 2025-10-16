import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingDown } from 'lucide-react';
import { UserScore, calculateUserScore, getScoreInterpretation, getScoreColor } from '@/lib/scoring';
import { Profile, Assignment, Company } from '@/types/crm';

interface AssignmentWithRelations extends Assignment {
  profiles: Profile;
  companies: Company;
}

export function UserRanking() {
  const [topUsers, setTopUsers] = useState<UserScore[]>([]);
  const [bottomUsers, setBottomUsers] = useState<UserScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRankings();

    // Recharger les rankings toutes les 10 secondes pour avoir les données à jour
    const interval = setInterval(() => {
      loadUserRankings();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadUserRankings = async () => {
    try {
      setIsLoading(true);

      // Récupérer tous les utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Récupérer toutes les assignations avec les données liées
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, profiles(id, user_id, name, role), companies(id, name, status)');

      if (assignmentsError) throw assignmentsError;

      // Calculer le score de chaque utilisateur
      const userScores: UserScore[] = profiles!.map((profile: Profile) => {
        const userAssignments = (assignments as AssignmentWithRelations[])
          .filter(a => a.user_id === profile.user_id)
          .map(a => ({
            id: a.companies.id,
            name: a.companies.name,
            status: a.companies.status
          }));

        return calculateUserScore(profile.user_id, profile.name, userAssignments);
      });

      // Trier par score décroissant
      const sortedByScore = [...userScores].sort((a, b) => b.averageScore - a.averageScore);

      // Top 3
      setTopUsers(sortedByScore.slice(0, 3));

      // Bottom 3 (au moins 1 entreprise assignée)
      const usersWithCompanies = sortedByScore.filter(u => u.companyCount > 0);
      setBottomUsers(usersWithCompanies.slice(-3).reverse());
    } catch (error) {
      console.error('Error loading user rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Meilleur Classement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              À Améliorer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top 3 Users */}
      <Card className="shadow-card border-green-200 dark:border-green-900">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Trophy className="h-5 w-5" />
            Top 3 Performeurs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {topUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucune donnée disponible</p>
          ) : (
            topUsers.map((user, index) => (
              <div key={user.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{user.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.companyCount} entreprise{user.companyCount > 1 ? 's' : ''} • Score moyen: {user.averageScore}
                  </p>
                </div>
                <Badge 
                  style={{ 
                    backgroundColor: getScoreColor(user.averageScore),
                    color: user.averageScore >= 50 ? '#000' : '#fff'
                  }}
                  className="whitespace-nowrap"
                >
                  {getScoreInterpretation(user.averageScore)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bottom 3 Users */}
      <Card className="shadow-card border-red-200 dark:border-red-900">
        <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <TrendingDown className="h-5 w-5" />
            À Améliorer
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {bottomUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucune donnée disponible</p>
          ) : (
            bottomUsers.map((user, index) => (
              <div key={user.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white font-bold text-sm">
                  {bottomUsers.length - index}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{user.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.companyCount} entreprise{user.companyCount > 1 ? 's' : ''} • Score moyen: {user.averageScore}
                  </p>
                </div>
                <Badge 
                  style={{ 
                    backgroundColor: getScoreColor(user.averageScore),
                    color: user.averageScore >= 50 ? '#000' : '#fff'
                  }}
                  className="whitespace-nowrap"
                >
                  {getScoreInterpretation(user.averageScore)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
