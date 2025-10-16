import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CompanyTable } from '@/components/companies/CompanyTable';
import { TagManager } from '@/components/tags/TagManager';
import { UserManagement } from '@/components/users/UserManagement';
import { AssignmentManager } from '@/components/assignments/AssignmentManager';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const validTabs = ['dashboard', 'companies', 'assignments', 'users', 'tags'];
  const tabFromUrl = searchParams.get('tab');
  const initialTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl! : 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, loading, profile } = useAuth();

  // Update activeTab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL to reflect the current tab
    if (tab === 'dashboard') {
      navigate('/', { replace: true });
    } else {
      navigate(`/?tab=${tab}`, { replace: true });
    }
  };

  // Redirect to auth if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect if volunteer tries to access tags tab
  const isVolunteer = profile?.role === 'VOLUNTEER' || !profile?.role;
  if (activeTab === 'tags' && isVolunteer) {
    navigate('/', { replace: true });
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'companies':
        return <CompanyTable />;
      case 'assignments':
        return <AssignmentManager />;
      case 'users':
        return <UserManagement />;
      case 'tags':
        return <TagManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
