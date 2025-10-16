import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Building2, TrendingUp } from 'lucide-react';
import { Company } from '@/types/crm';

interface CompanyScore {
  id: string;
  name: string;
  assignmentCount: number;
  status: string;
  rank: number;
}

export function CompanyRanking() {
  const [topCompanies, setTopCompanies] = useState<CompanyScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanyRankings();
  }, []);

  const loadCompanyRankings = async () => {
    try {
      setIsLoading(true);

      // Récupérer toutes les entreprises avec le nombre d'assignations
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          status,
          assignments:assignments(count)
        `);

      if (companiesError) throw companiesError;

      // Formatter les données et trier par nombre d'assignations
      const formattedCompanies: CompanyScore[] = (companies as any[])
        .map((company: any, index: number) => ({
          id: company.id,
          name: company.name,
          status: company.status,
          assignmentCount: company.assignments?.[0]?.count || 0,
          rank: index + 1
        }))
        .sort((a, b) => b.assignmentCount - a.assignmentCount);

      setTopCompanies(formattedCompanies.slice(0, 10));
    } catch (error) {
      console.error('Erreur lors du chargement du classement des entreprises:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'NOT_TO_CONTACT': 'Ne pas contacter',
      'TO_CONTACT': 'À démarcher',
      'CONTACTED': 'Contacté',
      'FIRST_FOLLOWUP': '1ère relance',
      'SECOND_FOLLOWUP': '2ème relance',
      'THIRD_FOLLOWUP': '3ème relance',
      'IN_DISCUSSION': 'En discussion',
      'COMING': 'Vient',
      'NOT_COMING': 'Ne vient pas',
      'NEXT_YEAR': 'Année prochaine'
    };
    return labels[status] || status;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Building2 className="h-5 w-5" />
          Classement des Entreprises
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement du classement...
          </div>
        ) : topCompanies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune entreprise trouvée
          </div>
        ) : (
          <div className="space-y-3">
            {topCompanies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 font-bold text-amber-700 dark:text-amber-300">
                    {company.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{getStatusLabel(company.status)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="ml-auto text-sm font-medium text-muted-foreground">
                    {company.assignmentCount} assignation{company.assignmentCount > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ScoringReference() {
  // This is kept for backward compatibility if needed elsewhere
  return null;
}
