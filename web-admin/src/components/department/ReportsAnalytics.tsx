import { BarChart3, TrendingUp, Users as UsersIcon, MapPin } from 'lucide-react';
import { DepartmentComplaint } from '@/types/department';

interface ReportsAnalyticsProps {
  complaints: DepartmentComplaint[];
  department: string;
}

export function ReportsAnalytics({ complaints, department }: ReportsAnalyticsProps) {
  // Calculate average resolution time
  const completedComplaints = complaints.filter(c => c.status === 'Completed' && c.resolutionTime);
  const avgResolutionTime = completedComplaints.length > 0
    ? Math.round(completedComplaints.reduce((sum, c) => sum + (c.resolutionTime || 0), 0) / completedComplaints.length)
    : 0;

  // Daily issues handled (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyStats = last7Days.map(date => {
    const count = completedComplaints.filter(c => {
      const completedDate = new Date(c.submittedAt);
      completedDate.setHours(completedDate.getHours() + (c.resolutionTime || 0));
      return completedDate.toISOString().split('T')[0] === date;
    }).length;
    return { date, count };
  });

  // Worker performance (mock data based on assigned workers)
  const workerStats = complaints
    .filter(c => c.assignedWorkerId)
    .reduce((acc, c) => {
      const workerId = c.assignedWorkerId!;
      if (!acc[workerId]) {
        acc[workerId] = { id: workerId, completed: 0, totalTime: 0, count: 0 };
      }
      if (c.status === 'Completed' && c.resolutionTime) {
        acc[workerId].completed += 1;
        acc[workerId].totalTime += c.resolutionTime;
        acc[workerId].count += 1;
      }
      return acc;
    }, {} as Record<string, { id: string; completed: number; totalTime: number; count: number }>);

  const topWorkers = Object.values(workerStats)
    .map(w => ({
      ...w,
      avgTime: w.count > 0 ? Math.round(w.totalTime / w.count) : 0
    }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Reports & Analytics
        </h3>
        <p className="text-sm text-muted-foreground">Performance metrics for {department} department</p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Resolution Time */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Average Resolution Time</h4>
                <p className="text-2xl font-bold text-foreground">{avgResolutionTime}h</p>
                <p className="text-xs text-muted-foreground">
                  Based on {completedComplaints.length} completed issues
                </p>
              </div>
            </div>
          </div>

          {/* Daily Issues Handled */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Daily Issues Resolved (Last 7 Days)</h4>
            <div className="space-y-2">
              {dailyStats.map((stat, index) => {
                const maxCount = Math.max(...dailyStats.map(s => s.count), 1);
                const percentage = (stat.count / maxCount) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-semibold text-foreground">{stat.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Worker Performance */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Top Worker Performance</h4>
            </div>
            
            {topWorkers.length > 0 ? (
              <div className="space-y-3">
                {topWorkers.map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{worker.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {worker.completed} tasks completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{worker.avgTime}h</p>
                      <p className="text-xs text-muted-foreground">avg time</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No worker performance data available yet.</p>
            )}
          </div>

          {/* Map Hotspots Placeholder */}
          <div className="md:col-span-2 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Issue Hotspot Map</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Geographic visualization of complaint distribution across your division
            </p>
            <div className="h-[200px] bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Map visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
