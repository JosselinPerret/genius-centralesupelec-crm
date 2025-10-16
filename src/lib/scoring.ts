import { CompanyStatus } from '@/types/crm';

// Système de scoring basé sur les statuts des entreprises
export const statusScores: Record<CompanyStatus, number> = {
  'NOT_TO_CONTACT': 10,      // Hors cible
  'TO_CONTACT': 0,            // Prospect brut
  'CONTACTED': 50,            // Premier contact
  'FIRST_FOLLOWUP': 60,       // Suivi initial
  'SECOND_FOLLOWUP': 70,      // Suivi poussé
  'THIRD_FOLLOWUP': 80,       // Dernier essai
  'IN_DISCUSSION': 100,        // Opportunité chaude
  'COMING': 500,              // Converti / client
  'NOT_COMING': 100,           // Opportunité perdue
  'NEXT_YEAR': 150              // Report / lead tiède
};

// Interface pour le score utilisateur
export interface UserScore {
  userId: string;
  userName: string;
  totalScore: number;
  companyCount: number;
  averageScore: number;
  companies: {
    id: string;
    name: string;
    status: CompanyStatus;
    score: number;
  }[];
}

/**
 * Calcule le score d'une entreprise basé sur son statut
 */
export function calculateCompanyScore(status: CompanyStatus): number {
  return statusScores[status] || 0;
}

/**
 * Calcule le score total d'un utilisateur basé sur ses entreprises assignées
 */
export function calculateUserScore(
  userId: string,
  userName: string,
  assignedCompanies: {
    id: string;
    name: string;
    status: CompanyStatus;
  }[]
): UserScore {
  const companiesWithScores = assignedCompanies.map(company => ({
    ...company,
    score: calculateCompanyScore(company.status)
  }));

  const totalScore = companiesWithScores.reduce((sum, c) => sum + c.score, 0);
  const averageScore = assignedCompanies.length > 0 
    ? Math.round(totalScore / assignedCompanies.length) 
    : 0;

  return {
    userId,
    userName,
    totalScore,
    companyCount: assignedCompanies.length,
    averageScore,
    companies: companiesWithScores
  };
}

/**
 * Retourne l'interprétation du score
 */
export function getScoreInterpretation(score: number): string {
  if (score >= 70) return 'Excellent';
  if (score >= 60) return 'Très bon';
  if (score >= 50) return 'Bon';
  if (score >= 40) return 'Correct';
  if (score >= 30) return 'Acceptable';
  return 'À améliorer';
}

/**
 * Retourne la couleur du badge basée sur le score
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'hsl(142, 71%, 45%)';   // Vert (Excellent)
  if (score >= 60) return 'hsl(45, 100%, 50%)';   // Orange/Jaune (Très bon)
  if (score >= 50) return 'hsl(200, 60%, 50%)';   // Bleu (Bon)
  if (score >= 40) return 'hsl(260, 60%, 50%)';   // Violet (Correct)
  if (score >= 30) return 'hsl(320, 60%, 50%)';   // Rose (Acceptable)
  return 'hsl(0, 71%, 50%)';                       // Rouge (À améliorer)
}
