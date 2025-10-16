import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Calendar } from 'lucide-react';
import { UserScore, calculateUserScore, getScoreColor } from '@/lib/scoring';
import { Profile, Assignment, Company } from '@/types/crm';

interface AssignmentWithRelations extends Omit<Assignment, 'created_at'> {
  profiles: Profile;
  companies: Company;
  created_at?: string;
}

export function UserRanking() {
  const [allTimeUsers, setAllTimeUsers] = useState<UserScore[]>([]);
  const [weeklyUsers, setWeeklyUsers] = useState<UserScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRankings();
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
        .select('*, profiles(id, user_id, name, role), companies(id, name, status), created_at');

      if (assignmentsError) throw assignmentsError;

      // Obtenir la date d'il y a 7 jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Calculer le score ALL TIME pour chaque utilisateur
      const allTimeScores: UserScore[] = profiles!.map((profile: Profile) => {
        const userAssignments = (assignments as AssignmentWithRelations[])
          .filter(a => a.user_id === profile.user_id)
          .map(a => ({
            id: a.companies.id,
            name: a.companies.name,
            status: a.companies.status
          }));

        return calculateUserScore(profile.user_id, profile.name, userAssignments);
      });

      // Calculer le score WEEKLY pour chaque utilisateur (changements de statut cette semaine)
      const weeklyScores: UserScore[] = profiles!.map((profile: Profile) => {
        const userAssignments = (assignments as AssignmentWithRelations[])
          .filter(a => 
            a.user_id === profile.user_id && 
            a.created_at && 
            new Date(a.created_at) >= sevenDaysAgo
          )
          .map(a => ({
            id: a.companies.id,
            name: a.companies.name,
            status: a.companies.status
          }));

        return calculateUserScore(profile.user_id, profile.name, userAssignments);
      });

      // Trier par score total décroissant
      const sortedAllTime = [...allTimeScores].sort((a, b) => b.totalScore - a.totalScore);
      const sortedWeekly = [...weeklyScores]
        .filter(u => u.companyCount > 0) // Montrer seulement les utilisateurs actifs cette semaine
        .sort((a, b) => b.totalScore - a.totalScore);

      setAllTimeUsers(sortedAllTime);
      setWeeklyUsers(sortedWeekly);
    } catch (error) {
      console.error('Error loading user rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRankingCard = (users: UserScore[], title: string, icon: React.ReactNode, gradient: string, isDark: boolean) => (
    <Card className={`shadow-card ${isDark ? 'border-red-200 dark:border-red-900' : 'border-green-200 dark:border-green-900'}`}>
      <CardHeader className={`bg-gradient-to-r ${gradient}`}>
        <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Aucune donnée disponible</p>
        ) : (
          users.slice(0, 5).map((user, index) => (
            <div key={user.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                isDark 
                  ? 'bg-gradient-to-br from-slate-400 to-slate-600' 
                  : 'bg-gradient-to-br from-yellow-400 to-amber-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{user.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {user.companyCount} entreprise{user.companyCount > 1 ? 's' : ''} • Score total: {user.totalScore}
                </p>
              </div>
              <div 
                className="px-2 py-1 rounded whitespace-nowrap text-xs font-semibold"
                style={{ 
                  backgroundColor: getScoreColor(user.totalScore),
                  color: user.totalScore >= 50 ? '#000' : '#fff'
                }}
              >
                {user.totalScore}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Classement ALL TIME
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
              <Calendar className="h-5 w-5 text-blue-500" />
              Classement de la Semaine
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
    <div className="space-y-6">
      {/* ALL TIME RANKING */}
      {renderRankingCard(
        allTimeUsers,
        'Classement ALL TIME',
        <Trophy className="h-5 w-5" />,
        'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
        false
      )}

      {/* WEEKLY RANKING */}
      {renderRankingCard(
        weeklyUsers,
        'Classement de la Semaine',
        <Calendar className="h-5 w-5" />,
        'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
        false
      )}
    </div>
  );
}
