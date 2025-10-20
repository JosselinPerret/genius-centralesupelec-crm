import { Building2, LayoutDashboard, Users, Tag, LogOut, UserCheck, BarChart3, UserCircle, Moon, Sun, Menu, X, Trophy, Merge2 } from 'lucide-react';
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
  id: 'duplicates',
  name: 'Doublons',
  icon: Merge2
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
      // If onTabChange is provided (we're on the main page), use it
      onTabChange(tab);
    } else {
      // If not, navigate to home with the tab as a query parameter
      console.log('Navigating to:', `/?tab=${tab}`);
      navigate(`/?tab=${tab}`);
    }
    // Close sidebar on mobile after tab click
    if (isMobile) {
      close();
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      close();
    }
  };

  // Sidebar content component for reusability
  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b border-border px-4 md:px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-lg md:text-xl font-bold text-foreground hidden sm:block">CRM - Genius</h1>
          </div>
          {profile && <Badge variant="secondary" className="text-xs">
            {profile.role}
          </Badge>}
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 md:px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded">
        {navigation.map(item => {
          const Icon = item.icon;
          return (
            <Button 
              key={item.id} 
              variant={activeTab === item.id ? "secondary" : "ghost"} 
              className={cn(
                "w-full justify-start text-sm md:text-base cursor-pointer",
                activeTab === item.id && "bg-primary/10 text-primary font-medium"
              )} 
              onClick={() => handleTabClick(item.id)}
              type="button"
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">{item.name}</span>
              <span className="inline sm:hidden text-xs">{item.name.split(' ')[0]}</span>
            </Button>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm md:text-base"
            onClick={() => handleNavigate('/my-statistics')}
          >
            <UserCircle className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="hidden sm:inline">Mes Statistiques</span>
            <span className="inline sm:hidden text-xs">Stats</span>
          </Button>
          
          {canViewUserStats && <Button 
            variant="ghost" 
            className="w-full justify-start text-sm md:text-base"
            onClick={() => handleNavigate('/user-statistics')}
          >
            <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="hidden sm:inline">Stats Utilisateurs</span>
            <span className="inline sm:hidden text-xs">Utilisateurs</span>
          </Button>}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm md:text-base"
            onClick={() => handleNavigate('/leaderboard')}
          >
            <Trophy className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="hidden sm:inline">Classement</span>
            <span className="inline sm:hidden text-xs">Class.</span>
          </Button>
        </div>
      </nav>

      <div className="border-t border-border p-2 md:p-3 space-y-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm md:text-base"
          onClick={toggleTheme}
          title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDark ? (
            <Sun className="mr-3 h-5 w-5 flex-shrink-0" />
          ) : (
            <Moon className="mr-3 h-5 w-5 flex-shrink-0" />
          )}
          <span className="hidden sm:inline">{isDark ? "Mode clair" : "Mode sombre"}</span>
          <span className="inline sm:hidden text-xs">{isDark ? "Clair" : "Sombre"}</span>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive text-sm md:text-base"
          onClick={signOut}
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="hidden sm:inline">Déconnexion</span>
          <span className="inline sm:hidden text-xs">Sortir</span>
        </Button>
      </div>
    </>
  );

  // Mobile view with overlay
  if (isMobile) {
    return (
      <>
        {/* Header with toggle button */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center px-4 z-40">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggle}
            className="mr-4"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="ml-2 font-bold text-foreground">CRM</h1>
        </div>

        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={close}
          />
        )}

        {/* Sidebar drawer */}
        <div className={cn(
          "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-40 flex flex-col transition-transform duration-300 ease-in-out overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )} style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}>
          <SidebarContent />
        </div>
      </>
    );
  }

  // Desktop view
  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-card border-r border-border sticky top-0">
      <SidebarContent />
    </div>
  );
}