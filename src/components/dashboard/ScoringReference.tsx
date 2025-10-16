import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Info } from 'lucide-react';

import { statusScores, getScoreInterpretation, getScoreColor } from '@/lib/scoring';import { Info } from 'lucide-react';import { Badge } from '@/components/ui/badge';

import { CompanyStatus } from '@/types/crm';

import { statusScores, getScoreInterpretation, getScoreColor } from '@/lib/scoring';import { COMPANY_SCORE_MAP, STATUS_INTERPRETATION } from '@/lib/scoring';

export function ScoringReference() {

  const statusNames: Record<CompanyStatus, string> = {import { CompanyStatus } from '@/types/crm';import { CompanyStatus } from '@/types/crm';

    'NOT_TO_CONTACT': 'Ne pas contacter',

    'TO_CONTACT': 'À démarcher',

    'CONTACTED': 'Contacté',

    'FIRST_FOLLOWUP': '1ère relance',export function ScoringReference() {export function ScoringReference() {

    'SECOND_FOLLOWUP': '2ème relance',

    'THIRD_FOLLOWUP': '3ème relance',  const statusNames: Record<CompanyStatus, string> = {  const statuses: CompanyStatus[] = [

    'IN_DISCUSSION': 'En discussion',

    'COMING': 'Vient',    'NOT_TO_CONTACT': 'Ne pas contacter',    'COMING',

    'NOT_COMING': 'Ne vient pas',

    'NEXT_YEAR': 'Année prochaine'    'TO_CONTACT': 'À démarcher',    'IN_DISCUSSION',

  };

    'CONTACTED': 'Contacté',    'THIRD_FOLLOWUP',

  const statusInterpretations: Record<CompanyStatus, string> = {

    'NOT_TO_CONTACT': 'Hors cible',    'FIRST_FOLLOWUP': '1ère relance',    'SECOND_FOLLOWUP',

    'TO_CONTACT': 'Prospect brut',

    'CONTACTED': 'Premier contact',    'SECOND_FOLLOWUP': '2ème relance',    'FIRST_FOLLOWUP',

    'FIRST_FOLLOWUP': 'Suivi initial',

    'SECOND_FOLLOWUP': 'Suivi poussé',    'THIRD_FOLLOWUP': '3ème relance',    'CONTACTED',

    'THIRD_FOLLOWUP': 'Dernier essai',

    'IN_DISCUSSION': 'Opportunité chaude',    'IN_DISCUSSION': 'En discussion',    'NEXT_YEAR',

    'COMING': 'Converti / client',

    'NOT_COMING': 'Opportunité perdue',    'COMING': 'Vient',    'NOT_COMING',

    'NEXT_YEAR': 'Report / lead tiède'

  };    'NOT_COMING': 'Ne vient pas',    'NOT_TO_CONTACT',



  const sortedStatuses = (Object.keys(statusScores) as CompanyStatus[])    'NEXT_YEAR': 'Année prochaine'    'TO_CONTACT',

    .sort((a, b) => statusScores[b] - statusScores[a]);

  };  ];

  return (

    <Card className="shadow-card">

      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">

        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">  const statusInterpretations: Record<CompanyStatus, string> = {  const getScoreColor = (score: number) => {

          <Info className="h-5 w-5" />

          Tableau de Scoring    'NOT_TO_CONTACT': 'Hors cible',    if (score >= 80) return 'bg-green-500';

        </CardTitle>

      </CardHeader>    'TO_CONTACT': 'Prospect brut',    if (score >= 60) return 'bg-blue-500';

      <CardContent className="pt-6">

        <div className="overflow-x-auto">    'CONTACTED': 'Premier contact',    if (score >= 40) return 'bg-yellow-500';

          <table className="w-full text-sm">

            <thead>    'FIRST_FOLLOWUP': 'Suivi initial',    if (score >= 20) return 'bg-orange-500';

              <tr className="border-b border-border">

                <th className="text-left py-2 px-3 font-semibold text-foreground">Statut</th>    'SECOND_FOLLOWUP': 'Suivi poussé',    return 'bg-red-500';

                <th className="text-center py-2 px-3 font-semibold text-foreground">Score</th>

                <th className="text-left py-2 px-3 font-semibold text-foreground">Interprétation</th>    'THIRD_FOLLOWUP': 'Dernier essai',  };

              </tr>

            </thead>    'IN_DISCUSSION': 'Opportunité chaude',

            <tbody>

              {sortedStatuses.map((status) => (    'COMING': 'Converti / client',  return (

                <tr key={status} className="border-b border-border/50 hover:bg-muted/50 transition-colors">

                  <td className="py-3 px-3 text-foreground font-medium">    'NOT_COMING': 'Opportunité perdue',    <div className="space-y-6">

                    {statusNames[status]}

                  </td>    'NEXT_YEAR': 'Report / lead tiède'      <div>

                  <td className="py-3 px-3 text-center">

                    <span  };        <h1 className="text-3xl font-bold text-foreground">Référence du Système de Scoring</h1>

                      className="inline-block px-3 py-1 rounded-full font-bold text-sm"

                      style={{        <p className="text-muted-foreground mt-2">

                        backgroundColor: getScoreColor(statusScores[status]),

                        color: statusScores[status] >= 50 ? '#000' : '#fff'  const sortedStatuses = (Object.keys(statusScores) as CompanyStatus[])          Guide complet des scores et des statuts d'entreprises

                      }}

                    >    .sort((a, b) => statusScores[b] - statusScores[a]);        </p>

                      {statusScores[status]}

                    </span>      </div>

                  </td>

                  <td className="py-3 px-3 text-muted-foreground">  return (

                    {statusInterpretations[status]}

                  </td>    <Card className="shadow-card">      <Card>

                </tr>

              ))}      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">        <CardHeader>

            </tbody>

          </table>        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">          <CardTitle>Système de Classement par Score</CardTitle>

        </div>

          <Info className="h-5 w-5" />          <CardDescription>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">

          <p className="font-semibold text-foreground">💡 Comment fonctionne le scoring:</p>          Tableau de Scoring            Chaque statut correspond à un score de 0 à 100. Les scores les plus élevés indiquent une meilleure opportunité.

          <ul className="list-disc list-inside space-y-1 text-muted-foreground">

            <li>Le score de chaque utilisateur est la <strong>moyenne</strong> de tous ses scores d'entreprises</li>        </CardTitle>          </CardDescription>

            <li>Plus le statut est avancé, plus le score est élevé</li>

            <li>Les meilleures conversions rapportent <strong>100 points</strong></li>      </CardHeader>        </CardHeader>

            <li>Les prospects non contactés rapportent <strong>0 points</strong></li>

            <li>Le classement se met à jour automatiquement en temps réel</li>      <CardContent className="pt-6">        <CardContent>

          </ul>

        </div>        <div className="overflow-x-auto">          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

      </CardContent>

    </Card>          <table className="w-full text-sm">            {statuses.map((status) => {

  );

}            <thead>              const score = COMPANY_SCORE_MAP[status];


              <tr className="border-b border-border">              const interpretation = STATUS_INTERPRETATION[status];

                <th className="text-left py-2 px-3 font-semibold text-foreground">Statut</th>

                <th className="text-center py-2 px-3 font-semibold text-foreground">Score</th>              return (

                <th className="text-left py-2 px-3 font-semibold text-foreground">Interprétation</th>                <div

              </tr>                  key={status}

            </thead>                  className="flex flex-col p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"

            <tbody>                >

              {sortedStatuses.map((status) => (                  <div className="flex items-start justify-between mb-3">

                <tr key={status} className="border-b border-border/50 hover:bg-muted/50 transition-colors">                    <div className="flex-1">

                  <td className="py-3 px-3 text-foreground font-medium">                      <h3 className="font-semibold text-foreground text-sm">

                    {statusNames[status]}                        {interpretation}

                  </td>                      </h3>

                  <td className="py-3 px-3 text-center">                      <p className="text-xs text-muted-foreground mt-1">

                    <span                        {status.replace(/_/g, ' ')}

                      className="inline-block px-3 py-1 rounded-full font-bold text-sm"                      </p>

                      style={{                    </div>

                        backgroundColor: getScoreColor(statusScores[status]),                  </div>

                        color: statusScores[status] >= 50 ? '#000' : '#fff'

                      }}                  <div className="flex items-center gap-3 mt-auto">

                    >                    <div className={`${getScoreColor(score)} px-3 py-1 rounded-full text-white text-sm font-bold`}>

                      {statusScores[status]}                      {score}

                    </span>                    </div>

                  </td>                    <div className="flex-1 bg-muted rounded-full h-2">

                  <td className="py-3 px-3 text-muted-foreground">                      <div

                    {statusInterpretations[status]}                        className={`${getScoreColor(score)} h-full rounded-full`}

                  </td>                        style={{ width: `${score}%` }}

                </tr>                      />

              ))}                    </div>

            </tbody>                  </div>

          </table>                </div>

        </div>              );

            })}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">          </div>

          <p className="font-semibold text-foreground">💡 Comment fonctionne le scoring:</p>        </CardContent>

          <ul className="list-disc list-inside space-y-1 text-muted-foreground">      </Card>

            <li>Le score de chaque utilisateur est la <strong>moyenne</strong> de tous ses scores d'entreprises</li>

            <li>Plus le statut est avancé, plus le score est élevé</li>      <div className="grid gap-6 md:grid-cols-3">

            <li>Les meilleures conversions rapportent <strong>100 points</strong></li>        <Card>

            <li>Les prospects non contactés rapportent <strong>0 points</strong></li>          <CardHeader>

            <li>Le classement se met à jour automatiquement en temps réel</li>            <CardTitle className="text-lg">🏆 Top Performers</CardTitle>

          </ul>            <CardDescription>Score 70+</CardDescription>

        </div>          </CardHeader>

      </CardContent>          <CardContent>

    </Card>            <div className="space-y-3">

  );              {statuses

}                .filter(s => COMPANY_SCORE_MAP[s] >= 70)

                .map(status => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{STATUS_INTERPRETATION[status]}</span>
                    <Badge className="bg-green-500">{COMPANY_SCORE_MAP[status]} pts</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚠️ À Relancer</CardTitle>
            <CardDescription>Score 20-60</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statuses
                .filter(s => COMPANY_SCORE_MAP[s] >= 20 && COMPANY_SCORE_MAP[s] < 70)
                .map(status => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{STATUS_INTERPRETATION[status]}</span>
                    <Badge className="bg-yellow-500">{COMPANY_SCORE_MAP[status]} pts</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🚀 À Commencer</CardTitle>
            <CardDescription>Score 0-20</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statuses
                .filter(s => COMPANY_SCORE_MAP[s] < 20)
                .map(status => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{STATUS_INTERPRETATION[status]}</span>
                    <Badge className="bg-red-500">{COMPANY_SCORE_MAP[status]} pts</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comment fonctionne le scoring ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Chaque entreprise a un score basé sur :</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong>Son statut actuel</strong> - Le score change automatiquement quand vous mettez à jour le statut</li>
              <li><strong>Son potentiel de conversion</strong> - Plus le score est élevé, plus l'opportunité est chaude</li>
              <li><strong>L'effort requis</strong> - Les statuts avec score faible nécessitent plus de travail</li>
            </ul>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold mb-2">Utilisation du classement :</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong>Top 3</strong> - Vos meilleures opportunités à finaliser</li>
              <li><strong>Bottom 3</strong> - Les entreprises qui ont besoin le plus d'attention</li>
              <li><strong>Score moyen</strong> - Indicateur de la santé globale de votre pipeline</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
