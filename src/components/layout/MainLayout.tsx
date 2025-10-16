import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
