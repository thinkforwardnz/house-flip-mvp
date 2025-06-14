
import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-soft-blue-mobile md:bg-gradient-blue">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* The background is now handled by SidebarInset which defaults to bg-background (white) */}
          <div className="min-h-screen"> 
            {/* Mobile sidebar trigger */}
            <div className="md:hidden p-4">
              <SidebarTrigger className="text-navy-dark" /> {/* Changed from text-white to text-navy-dark */}
            </div>
            
            {/* Main content area with responsive padding */}
            <div className="p-4 md:p-6">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
