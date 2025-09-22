import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CompanyTable } from '@/components/companies/CompanyTable';
import { mockCompanies } from '@/data/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'companies':
        return <CompanyTable companies={mockCompanies} />;
      case 'users':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
            <p className="text-muted-foreground">User management features will be available after connecting Supabase for authentication.</p>
          </div>
        );
      case 'tags':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Tag Management</h2>
            <p className="text-muted-foreground">Tag management features coming soon.</p>
          </div>
        );
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
