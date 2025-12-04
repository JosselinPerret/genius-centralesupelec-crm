import { Building2, LayoutDashboard, Users, Tag, LogOut, UserCheck, BarChart3, UserCircle, Moon, Sun, Menu, X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/use-sidebar';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
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
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { isOpen, isMobile, toggle, close } = useSidebar();
  
  const canViewUserStats = profile?.role === 'ADMIN' || profile?.role === 'MANAGER';

  const handleTabClick = (tab: string) => {
    console.log('handleTabClick called with:', tab, 'onTabChange:', !!onTabChange);
    if (onTabChange) {
      onTabChange(tab);
    } else {
      console.log('Navigating to:', `/?tab=${tab}`);
      navigate(`/?tab=${tab}`);
    }
    if (isMobile) {
      close();
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      close();
    }
  };

  const NavButton = ({ item, isActive }: { item: typeof navigation[0], isActive: boolean }) => {
    const Icon = item.icon;
    return (
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start gap-3 h-11 px-3 text-sm font-medium transition-all duration-200",
          isActive 
            ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none" 
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )} 
        onClick={() => handleTabClick(item.id)}
        type="button"
      >
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )} />
        <span>{item.name}</span>
      </Button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-md">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-foreground">CRM Genius</h1>
              <span className="text-xs text-muted-foreground">Gestion d'entreprises</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* User info */}
      {profile && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile.name}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                {profile.role}
              </Badge>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu principal
        </p>
        {navigation.map(item => (
          <NavButton key={item.id} item={item} isActive={activeTab === item.id} />
        ))}
        
        <div className="pt-4 mt-4 border-t border-sidebar-border">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Statistiques
          </p>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-11 px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => handleNavigate('/my-statistics')}
          >
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span>Mes Statistiques</span>
          </Button>
          
          {canViewUserStats && (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-11 px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => handleNavigate('/user-statistics')}
            >
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span>Stats Utilisateurs</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-11 px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => handleNavigate('/leaderboard')}
          >
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <span>Classement</span>
          </Button>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-10 px-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={toggleTheme}
          title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-warning" />
          ) : (
            <Moon className="h-5 w-5 text-muted-foreground" />
          )}
          <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-10 px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </div>
  );

  // Mobile view with overlay
  if (isMobile) {
    return (
      <>
        {/* Header with toggle button */}
        <div className="fixed top-0 left-0 right-0 h-16 glass-strong border-b border-border/50 flex items-center px-4 z-40">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggle}
            className="mr-4 hover:bg-primary/10"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary shadow-sm">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-foreground">CRM Genius</h1>
          </div>
        </div>

        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 animate-fade-in"
            onClick={close}
          />
        )}

        {/* Sidebar drawer */}
        <div className={cn(
          "fixed inset-y-0 left-0 w-72 glass-strong border-r border-border/50 z-40 flex flex-col transition-transform duration-300 ease-out overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )} style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}>
          <SidebarContent />
        </div>
      </>
    );
  }

  // Desktop view
  return (
    <div className="hidden md:flex h-screen w-72 flex-col glass-strong border-r border-border/50 sticky top-0">
      <SidebarContent />
    </div>
  );
}