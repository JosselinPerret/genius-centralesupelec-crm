import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverBg: 'group-hover:bg-primary',
  },
  primary: {
    iconBg: 'bg-gradient-primary',
    iconColor: 'text-white',
    hoverBg: '',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    hoverBg: 'group-hover:bg-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    hoverBg: 'group-hover:bg-warning',
  },
  info: {
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    hoverBg: 'group-hover:bg-info',
  },
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  variant = 'default'
}: StatsCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {value}
              </span>
              {trend && (
                <div className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors",
                  trend.isPositive 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                )}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
            )}
          </div>
          
          <div className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 flex-shrink-0",
            styles.iconBg,
            styles.iconColor,
            styles.hoverBg,
            "group-hover:text-white group-hover:scale-110 group-hover:shadow-lg"
          )}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}