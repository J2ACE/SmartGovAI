import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  title?: string;
}

export function AdminLayout({ title = 'Dashboard' }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hideSidebar, setHideSidebar] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Hide sidebar for Department Head dashboard
    const role = localStorage.getItem('selectedRole');
    const isDeptDashboard = location.pathname.includes('/dept-dashboard');
    setHideSidebar(role === 'department-head' && isDeptDashboard);
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      {!hideSidebar && (
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      )}
      
      <div className={cn(
        'transition-all duration-300',
        hideSidebar ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <AdminHeader title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
