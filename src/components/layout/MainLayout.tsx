import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row overflow-hidden bg-mesh bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col pt-16 md:pt-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}