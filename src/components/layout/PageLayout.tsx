import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, X, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/hooks/use-sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  actions?: ReactNode;
  showHeader?: boolean;
}

/**
 * PageLayout - Wrapper réutilisable pour toutes les pages
 * Fournit:
 * - Structure responsive (flex-col mobile, flex-row desktop)
 * - Header fixe sur mobile avec hamburger
 * - Sidebar drawer sur mobile
 * - pt-16 md:pt-0 pour compenser le header fixe
 * - Spacing/padding responsive
 */
export function PageLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backTo = '/',
  actions,
  showHeader = true,
}: PageLayoutProps) {
  const navigate = useNavigate();
  const { isOpen, isMobile, toggle, close } = useSidebar();
  const { profile } = useAuth();

  const handleBackClick = () => {
    navigate(backTo);
  };

  const handleOverlayClick = () => {
    close();
  };

  return (
    <div className="flex h-screen w-screen flex-col md:flex-row bg-background overflow-hidden">
      {/* Mobile Header */}
      {showHeader && (
        <div className="fixed top-0 left-0 right-0 h-16 md:hidden bg-background border-b border-border px-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <Building2 className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">{title || 'CRM'}</span>
              {profile && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {profile.role}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar (Desktop or Mobile Drawer) */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:translate-x-0 z-40 ${
          isMobile && isOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <MiniSidebar onClose={close} isMobile={isMobile} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col pt-16 md:pt-0">
        {/* Page Header with Title */}
        {showHeader && (
          <div className="border-b border-border bg-background sticky top-0 z-10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {showBackButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackClick}
                      className="flex-shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-sm md:text-base text-muted-foreground mt-1 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                {actions && <div className="flex-shrink-0">{actions}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * MiniSidebar - Version réduite du sidebar pour le drawer mobile
 */
function MiniSidebar({
  onClose,
  isMobile,
}: {
  onClose: () => void;
  isMobile: boolean;
}) {
  const { profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const canViewUserStats = profile?.role === 'ADMIN' || profile?.role === 'MANAGER';

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-lg font-bold text-foreground hidden sm:block">CRM - Genius</h1>
          </div>
          {profile && (
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
              {profile.role}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          onClick={() => handleNavigate('/my-statistics')}
        >
          <span>Mes Statistiques</span>
        </Button>

        {canViewUserStats && (
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => handleNavigate('/user-statistics')}
          >
            <span>Stats Utilisateurs</span>
          </Button>
        )}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          onClick={toggleTheme}
          title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive text-sm"
          onClick={signOut}
        >
          <span>Déconnexion</span>
        </Button>
      </div>
    </>
  );
}
