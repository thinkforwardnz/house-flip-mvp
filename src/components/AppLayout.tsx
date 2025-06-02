
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AppSidebar } from '@/components/AppSidebar';
import AuthForm from '@/components/AuthForm';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-blue flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-blue">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="bg-gradient-blue min-h-screen">
            {/* Mobile sidebar trigger */}
            <div className="md:hidden p-4">
              <SidebarTrigger className="text-white" />
            </div>
            
            {/* Main content area */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
