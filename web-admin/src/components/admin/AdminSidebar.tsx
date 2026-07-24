import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCog, 
  Brain, 
  Bell, 
  BarChart3, 
  Settings,
  MapPin,
  ChevronLeft,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Complaints', href: '/admin/complaints' },
  { icon: Users, label: 'Contractors', href: '/admin/contractors' },
  { icon: UserCog, label: 'Local Contractors', href: '/admin/local-contractors' },
  { icon: Brain, label: 'ML Predictions', href: '/admin/predictions' },
  { icon: Bell, label: 'Alerts', href: '/admin/alerts' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link to="/admin" className="flex items-center justify-center overflow-visible w-full">
          {isCollapsed ? (
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img src="/Nivaranam.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                <img src="/Nivaranam.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-lg font-bold text-foreground whitespace-nowrap">
                Nivāraṇam
              </span>
            </>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            'w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors',
            isCollapsed && 'absolute -right-4 top-4 bg-card border border-border shadow-md'
          )}
        >
          <ChevronLeft className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            isCollapsed && 'rotate-180'
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </Link>
      </div>
    </aside>
  );
}
