import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CompanyTable } from '@/components/companies/CompanyTable';
import { TagManager } from '@/components/tags/TagManager';
import { UserManagement } from '@/components/users/UserManagement';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'companies':
        return <CompanyTable />;
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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
