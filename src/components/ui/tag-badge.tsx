import { Badge } from '@/components/ui/badge';
import { Tag } from '@/types/crm';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: Tag;
  className?: string;
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn('border', className)}
      style={{
        backgroundColor: `${tag.color}15`,
        borderColor: `${tag.color}40`,
        color: tag.color,
      }}
    >
      {tag.name}
    </Badge>
  );
}