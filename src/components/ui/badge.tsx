import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: 
          "border-transparent bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary",
        secondary: 
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: 
          "border-transparent bg-destructive/90 text-destructive-foreground shadow-sm hover:bg-destructive",
        outline: 
          "border-border/50 text-foreground bg-background/50 backdrop-blur-sm",
        success:
          "border-transparent bg-success/90 text-success-foreground shadow-sm hover:bg-success",
        warning:
          "border-transparent bg-warning/90 text-warning-foreground shadow-sm hover:bg-warning",
        info:
          "border-transparent bg-info/90 text-info-foreground shadow-sm hover:bg-info",
        glass:
          "border-border/30 bg-card/50 backdrop-blur-sm text-foreground shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };