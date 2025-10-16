import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { statusScores, getScoreInterpretation, getScoreColor } from '@/lib/scoring';
import { CompanyStatus } from '@/types/crm';

export function ScoringReference() {
  const statusNames: Record<CompanyStatus, string> = {
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

  const statusInterpretations: Record<CompanyStatus, string> = {
    'NOT_TO_CONTACT': 'Hors cible',
    'TO_CONTACT': 'Prospect brut',
    'CONTACTED': 'Premier contact',
    'FIRST_FOLLOWUP': 'Suivi initial',
    'SECOND_FOLLOWUP': 'Suivi poussé',
    'THIRD_FOLLOWUP': 'Dernier essai',
    'IN_DISCUSSION': 'Opportunité chaude',
    'COMING': 'Converti / client',
    'NOT_COMING': 'Opportunité perdue',
    'NEXT_YEAR': 'Report / lead tiède'
  };

  const sortedStatuses = (Object.keys(statusScores) as CompanyStatus[])
    .sort((a, b) => statusScores[b] - statusScores[a]);

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Info className="h-5 w-5" />
          Tableau de Scoring
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Statut</th>
                <th className="text-center py-2 px-3 font-semibold text-foreground">Score</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Interprétation</th>
              </tr>
            </thead>
            <tbody>
              {sortedStatuses.map((status) => (
                <tr key={status} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-3 text-foreground font-medium">
                    {statusNames[status]}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className="inline-block px-3 py-1 rounded-full font-bold text-sm"
                      style={{
                        backgroundColor: getScoreColor(statusScores[status]),
                        color: statusScores[status] >= 50 ? '#000' : '#fff'
                      }}
                    >
                      {statusScores[status]}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {statusInterpretations[status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
          <p className="font-semibold text-foreground">💡 Comment fonctionne le scoring:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Le score de chaque utilisateur est la <strong>moyenne</strong> de tous ses scores d'entreprises</li>
            <li>Plus le statut est avancé, plus le score est élevé</li>
            <li>Les meilleures conversions rapportent <strong>100 points</strong></li>
            <li>Les prospects non contactés rapportent <strong>0 points</strong></li>
            <li>Le classement se met à jour automatiquement en temps réel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
