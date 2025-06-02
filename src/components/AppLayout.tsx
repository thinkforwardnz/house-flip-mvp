
import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
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
