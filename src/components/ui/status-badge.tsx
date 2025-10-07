import { Badge } from '@/components/ui/badge';
import { CompanyStatus } from '@/types/crm';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CompanyStatus;
  className?: string;
}

const statusConfig = {
  NOT_TO_CONTACT: {
    label: "N'est pas à démarcher",
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  TO_CONTACT: {
    label: 'A démarcher',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  CONTACTED: {
    label: 'Contacté',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  FIRST_FOLLOWUP: {
    label: '1ère relance',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  SECOND_FOLLOWUP: {
    label: '2e relance',
    className: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  THIRD_FOLLOWUP: {
    label: '3e relance',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  IN_DISCUSSION: {
    label: 'En discussion',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  COMING: {
    label: 'Vient',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  NOT_COMING: {
    label: 'Ne vient pas',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  NEXT_YEAR: {
    label: 'Année prochaine',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}