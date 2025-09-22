import { Badge } from '@/components/ui/badge';
import { CompanyStatus } from '@/types/crm';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CompanyStatus;
  className?: string;
}

const statusConfig = {
  PROSPECT: {
    label: 'Prospect',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  REFUSE: {
    label: 'Refusé',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  EN_COURS: {
    label: 'En cours de discussion',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  RELANCE: {
    label: 'Relance',
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