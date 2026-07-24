import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'destructive' | 'info';
}

const colorClasses = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'bg-primary text-primary-foreground'
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    icon: 'bg-accent text-accent-foreground'
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: 'bg-success text-success-foreground'
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'bg-warning text-warning-foreground'
  },
  destructive: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    icon: 'bg-destructive text-destructive-foreground'
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    icon: 'bg-info text-info-foreground'
  }
};

export function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
