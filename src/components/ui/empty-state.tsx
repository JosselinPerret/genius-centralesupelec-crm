import { LucideIcon, Building2, Users, Tag, Search, FileX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function EmptyCompanies({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Building2}
      title="Aucune entreprise"
      description="Vous n'avez pas encore ajouté d'entreprise. Commencez par créer votre première entreprise."
      action={onAdd ? { label: "Ajouter une entreprise", onClick: onAdd } : undefined}
    />
  );
}

export function EmptySearchResults({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="Aucun résultat"
      description="Aucune entreprise ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
      action={onClear ? { label: "Effacer les filtres", onClick: onClear } : undefined}
    />
  );
}

export function EmptyUsers() {
  return (
    <EmptyState
      icon={Users}
      title="Aucun utilisateur"
      description="Aucun utilisateur n'a encore été créé dans le système."
    />
  );
}

export function EmptyTags({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Tag}
      title="Aucune étiquette"
      description="Vous n'avez pas encore créé d'étiquettes. Les étiquettes vous aident à organiser vos entreprises."
      action={onAdd ? { label: "Créer une étiquette", onClick: onAdd } : undefined}
    />
  );
}

export function EmptyAssignments() {
  return (
    <EmptyState
      icon={FileX}
      title="Aucune assignation"
      description="Vous n'avez pas encore d'entreprises assignées. Contactez un administrateur pour obtenir des assignations."
    />
  );
}

export function EmptyActivity() {
  return (
    <EmptyState
      icon={Inbox}
      title="Aucune activité récente"
      description="Il n'y a pas encore d'activité à afficher."
    />
  );
}
