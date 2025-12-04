import { Building2, LayoutDashboard, Users, Tag, LogOut, UserCheck, BarChart3, UserCircle, Moon, Sun, Menu, X, Trophy, ChevronLeft, ChevronRight, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/use-sidebar';
import { GlobalSearch, useGlobalSearch, SearchTrigger } from './GlobalSearch';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navigation = [{
  id: 'dashboard',
  name: 'Tableau de bord',
  icon: LayoutDashboard,
  color: 'text-primary'
}, {
  id: 'companies',
  name: 'Entreprises',
  icon: Building2,
  color: 'text-info'
}, {
  id: 'assignments',
  name: 'Assignations',
  icon: UserCheck,
  color: 'text-success'
}, {
  id: 'users',
  name: 'Utilisateurs',
  icon: Users,
  color: 'text-warning'
}, {
  id: 'tags',
  name: 'Étiquettes',
  icon: Tag,
  color: 'text-accent'
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
  const globalSearch = useGlobalSearch();

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
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
    
    // Collapsed mode - icon only with tooltip
    if (!isOpen && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-center h-12 px-3 transition-all duration-300 rounded-xl",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )} 
              onClick={() => handleTabClick(item.id)}
              type="button"
            >
              <Icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return (
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start gap-3 h-12 px-4 text-sm font-medium transition-all duration-300 rounded-xl group",
          isActive 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )} 
        onClick={() => handleTabClick(item.id)}
        type="button"
      >
        <Icon className={cn(
          "h-5 w-5 transition-transform duration-300",
          !isActive && "group-hover:scale-110"
        )} />
        <span className="font-medium">{item.name}</span>
        {isActive && <Sparkles className="h-3 w-3 ml-auto animate-pulse" />}
      </Button>
    );
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border/50 px-4">
        <div className="flex items-center justify-between w-full">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-primary shadow-lg shadow-primary/25 flex-shrink-0 transition-transform hover:scale-105">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">CRM Genius</h1>
                <span className="text-[11px] text-muted-foreground">Gestion d'entreprises</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User info */}
      {profile && (
        <div className={cn("px-3 py-4 border-b border-sidebar-border/50", collapsed && "px-2")}>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary text-white text-sm font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.role}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-primary text-white text-sm font-bold shadow-md">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile.name}</p>
                <Badge className="mt-1 text-[10px] px-2 py-0 h-5 bg-primary/10 text-primary border-0 font-medium">
                  {profile.role}
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-4">
          <button
            onClick={globalSearch.open}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-xl transition-colors group"
          >
            <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span>Rechercher...</span>
            <kbd className="ml-auto text-[10px] bg-background px-2 py-0.5 rounded-md border font-mono">⌘K</kbd>
          </button>
        </div>
      )}
      
      {/* Navigation */}
      <nav className={cn("flex-1 px-3 py-4 space-y-2 overflow-y-auto", collapsed && "px-2")}>
        {!collapsed && (
          <p className="px-4 mb-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Navigation
          </p>
        )}
        {navigation.map((item, index) => (
          <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <NavButton item={item} isActive={activeTab === item.id} />
          </div>
        ))}
        
        <div className="pt-4 mt-4 border-t border-sidebar-border/50">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Statistiques
            </p>
          )}
          
          {collapsed ? (
            <>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center h-11 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => handleNavigate('/my-statistics')}
                  >
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>Mes Statistiques</TooltipContent>
              </Tooltip>
              
              {canViewUserStats && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center h-11 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      onClick={() => handleNavigate('/user-statistics')}
                    >
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>Stats Utilisateurs</TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center h-11 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => handleNavigate('/leaderboard')}
                  >
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>Classement</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {collapsed ? (
          <>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-center h-10 px-3 text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={toggleTheme}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-warning" />
                  ) : (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                {isDark ? "Mode clair" : "Mode sombre"}
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-center h-10 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={signOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>Déconnexion</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );

  // Mobile view with overlay
  if (isMobile) {
    return (
      <TooltipProvider>
        {/* Global Search Modal */}
        <GlobalSearch open={globalSearch.isOpen} onOpenChange={globalSearch.setIsOpen} />
        
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
      </TooltipProvider>
    );
  }

  // Desktop view
  return (
    <TooltipProvider>
      <GlobalSearch open={globalSearch.isOpen} onOpenChange={globalSearch.setIsOpen} />
      <div 
        className={cn(
          "hidden md:flex h-screen flex-col glass-strong border-r border-border/50 sticky top-0 transition-all duration-300 ease-in-out relative",
          isOpen ? "w-72" : "w-[72px]"
        )}
      >
        <SidebarContent collapsed={!isOpen} />
        
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border/50 bg-background shadow-sm hover:bg-sidebar-accent z-50"
          title={isOpen ? "Réduire le menu" : "Agrandir le menu"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
}