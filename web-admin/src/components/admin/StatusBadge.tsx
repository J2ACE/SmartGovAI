import { cn } from '@/lib/utils';
import { ComplaintStatus, Priority } from '@/lib/mockData';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const statusStyles: Record<ComplaintStatus, string> = {
  Submitted: 'bg-muted text-muted-foreground',
  Verified: 'bg-info/10 text-info',
  Assigned: 'bg-warning/10 text-warning',
  'In Progress': 'bg-accent/20 text-accent-foreground',
  Completed: 'bg-success/10 text-success',
  Closed: 'bg-primary/10 text-primary'
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusStyles[status]
    )}>
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityStyles: Record<Priority, string> = {
  High: 'bg-destructive/10 text-destructive',
  Medium: 'bg-warning/10 text-warning',
  Low: 'bg-success/10 text-success'
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      priorityStyles[priority]
    )}>
      {priority}
    </span>
  );
}

interface ContractorStatusBadgeProps {
  status: 'Active' | 'Busy' | 'Suspended' | 'Flagged';
}

const contractorStatusStyles: Record<string, string> = {
  Active: 'bg-success/10 text-success',
  Busy: 'bg-warning/10 text-warning',
  Suspended: 'bg-muted text-muted-foreground',
  Flagged: 'bg-destructive/10 text-destructive'
};

export function ContractorStatusBadge({ status }: ContractorStatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      contractorStatusStyles[status]
    )}>
      {status}
    </span>
  );
}

interface AlertTypeBadgeProps {
  type: string;
}

const alertTypeStyles: Record<string, string> = {
  'Repeated Issue': 'bg-warning/10 text-warning',
  'Long Pending': 'bg-destructive/10 text-destructive',
  'Unresponsive Contractor': 'bg-destructive/10 text-destructive',
  'High Volume': 'bg-info/10 text-info',
  'Hotspot Warning': 'bg-accent/20 text-accent-foreground'
};

export function AlertTypeBadge({ type }: AlertTypeBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      alertTypeStyles[type] || 'bg-muted text-muted-foreground'
    )}>
      {type}
    </span>
  );
}
