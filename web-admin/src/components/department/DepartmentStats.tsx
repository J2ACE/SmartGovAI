import { FileText, Clock, AlertTriangle, UserCheck, Timer } from 'lucide-react';
import { DepartmentComplaint } from '@/types/department';

interface DepartmentStatsProps {
  complaints: DepartmentComplaint[];
}

export function DepartmentStats({ complaints }: DepartmentStatsProps) {
  // Calculate stats
  const totalIssues = complaints.length;
  const pendingIssues = complaints.filter(c => c.status === 'Submitted').length;
  const assignedIssues = complaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length;
  const waitingApprovalIssues = complaints.filter(c => c.status === 'Verified').length;
  
  // SLA nearing breach (within 24 hours)
  const slaNearingBreachIssues = complaints.filter(c => {
    if (!c.slaDueAt) return false;
    const now = new Date();
    const slaDate = new Date(c.slaDueAt);
    const hoursRemaining = (slaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursRemaining > 0 && hoursRemaining <= 24;
  }).length;

  const stats = [
    {
      title: 'Total Issues',
      value: totalIssues,
      subtitle: 'For this department',
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Pending Cases',
      value: pendingIssues,
      subtitle: 'Awaiting action',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Assigned to Staff',
      value: assignedIssues,
      subtitle: 'In progress',
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Waiting Approval',
      value: waitingApprovalIssues,
      subtitle: 'Needs verification',
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'SLA Nearing Breach',
      value: slaNearingBreachIssues,
      subtitle: 'Within 24 hours',
      icon: Timer,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-foreground">{stat.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
