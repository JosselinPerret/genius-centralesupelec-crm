import { Building2, LayoutDashboard, Users, Tag, LogOut, UserCheck, BarChart3, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const navigation = [{
  id: 'dashboard',
  name: 'Tableau de bord',
  icon: LayoutDashboard
}, {
  id: 'companies',
  name: 'Entreprises',
  icon: Building2
}, {
  id: 'assignments',
  name: 'Assignations',
  icon: UserCheck
}, {
  id: 'users',
  name: 'Utilisateurs',
  icon: Users
}, {
  id: 'tags',
  name: 'Étiquettes',
  icon: Tag
}];
export function Sidebar({
  activeTab,
  onTabChange
}: SidebarProps) {
  const {
    profile,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const canViewUserStats = profile?.role === 'ADMIN' || profile?.role === 'MANAGER';
  const canViewTags = profile?.role === 'ADMIN' || profile?.role === 'MANAGER';
  return <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">CRM - Genius</h1>
          </div>
          {profile && <Badge variant="secondary" className="text-xs">
              {profile.role}
            </Badge>}
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map(item => {
        const Icon = item.icon;
        // Hide tags for volunteers
        if (item.id === 'tags' && !canViewTags) {
          return null;
        }
        return <Button key={item.id} variant={activeTab === item.id ? "secondary" : "ghost"} className={cn("w-full justify-start", activeTab === item.id && "bg-primary/10 text-primary font-medium")} onClick={() => onTabChange(item.id)}>
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Button>;
      })}
        
        <div className="pt-4 mt-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/my-statistics')}>
            <UserCircle className="mr-3 h-5 w-5" />
            Mes Statistiques
          </Button>
          
          {canViewUserStats && <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/user-statistics')}>
              <BarChart3 className="mr-3 h-5 w-5" />
              Stats Utilisateurs
            </Button>}
        </div>
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={signOut}>
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>;
}