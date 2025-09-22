import { Building2, LayoutDashboard, Users, Tag, Settings, LogOut, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'companies', name: 'Entreprises', icon: Building2 },
  { id: 'assignments', name: 'Assignations', icon: UserCheck },
  { id: 'users', name: 'Utilisateurs', icon: Users },
  { id: 'tags', name: 'Étiquettes', icon: Tag },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { profile, signOut } = useAuth();
  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Système CRM</h1>
          </div>
          {profile && (
            <Badge variant="secondary" className="text-xs">
              {profile.role}
            </Badge>
          )}
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-primary/10 text-primary font-medium"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-3 h-5 w-5" />
          Paramètres
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}