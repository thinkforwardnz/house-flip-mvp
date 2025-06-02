
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { 
  Home, 
  Search,
  FileText,
  Handshake,
  ClipboardCheck,
  Hammer,
  Building,
  Trophy,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/find', label: 'Find Properties', icon: Search },
  { path: '/analysis', label: 'Analysis', icon: FileText },
  { path: '/offer', label: 'Offer', icon: Handshake },
  { path: '/under-contract', label: 'Under Contract', icon: ClipboardCheck },
  { path: '/renovation', label: 'Renovation', icon: Hammer },
  { path: '/listed', label: 'Listed', icon: Building },
  { path: '/sold', label: 'Sold', icon: Trophy },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-primary rounded-lg flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-navy-dark">NZ House Flipping</h1>
            <p className="text-xs text-navy">Property Investment Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.path} className="flex items-center gap-3 px-4 py-3 rounded-xl">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        
        {/* User Profile Section */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-primary text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-dark truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-navy">Property Investor</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link to="/settings" className="w-full">
            <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
