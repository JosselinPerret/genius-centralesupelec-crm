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
    className: 'bg-warning text-warning-foreground border-warning/20',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-success text-success-foreground border-success/20',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
  FORMER: {
    label: 'Former',
    className: 'bg-destructive text-destructive-foreground border-destructive/20',
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