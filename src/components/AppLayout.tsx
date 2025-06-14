
import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      {/* The main wrapper is flex and fills width; sidebar + main content */}
      <div className="min-h-screen flex flex-col md:flex-row w-full bg-soft-blue-mobile md:bg-gradient-blue">
        {/* Sidebar handled as column on mobile, row on desktop */}
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          {/* Mobile sidebar trigger */}
          <div className="block md:hidden p-3">
            <SidebarTrigger className="text-navy-dark" />
          </div>
          {/* Main content area with responsive padding and vertical scroll */}
          <div className="flex-1 flex flex-col p-2 xs:p-4 md:p-6 max-w-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
