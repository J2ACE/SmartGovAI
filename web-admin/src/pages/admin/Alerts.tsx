import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  UserX, 
  TrendingUp, 
  MapPin,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertTypeBadge } from '@/components/admin/StatusBadge';
import { mockAlerts } from '@/lib/mockData';
import { toast } from 'sonner';

const alertIcons: Record<string, typeof AlertTriangle> = {
  'Repeated Issue': AlertTriangle,
  'Long Pending': Clock,
  'Unresponsive Contractor': UserX,
  'High Volume': TrendingUp,
  'Hotspot Warning': MapPin
};

const alertColors: Record<string, string> = {
  'Repeated Issue': 'border-warning/50 bg-warning/5',
  'Long Pending': 'border-destructive/50 bg-destructive/5',
  'Unresponsive Contractor': 'border-destructive/50 bg-destructive/5',
  'High Volume': 'border-info/50 bg-info/5',
  'Hotspot Warning': 'border-accent/50 bg-accent/5'
};

const alertIconColors: Record<string, string> = {
  'Repeated Issue': 'bg-warning text-warning-foreground',
  'Long Pending': 'bg-destructive text-destructive-foreground',
  'Unresponsive Contractor': 'bg-destructive text-destructive-foreground',
  'High Volume': 'bg-info text-info-foreground',
  'Hotspot Warning': 'bg-accent text-accent-foreground'
};

export default function Alerts() {
  const handleDismiss = (id: string) => {
    toast.success('Alert dismissed');
  };

  const handleView = (id: string) => {
    toast.info('Viewing related complaints...');
  };

  // Group alerts by type
  const criticalAlerts = mockAlerts.filter(a => 
    a.type === 'Long Pending' || a.type === 'Unresponsive Contractor'
  );
  const warningAlerts = mockAlerts.filter(a => 
    a.type === 'Repeated Issue' || a.type === 'High Volume' || a.type === 'Hotspot Warning'
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{criticalAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{warningAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Critical Alerts
          </h2>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              return (
                <div
                  key={alert.id}
                  className={`rounded-xl p-5 border ${alertColors[alert.type]} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${alertIconColors[alert.type]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <AlertTypeBadge type={alert.type} />
                          <p className="font-medium text-foreground mt-2">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{alert.division} Division</span>
                            <span>•</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleView(alert.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-warning" />
            Warnings & Notifications
          </h2>
          <div className="space-y-3">
            {warningAlerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              return (
                <div
                  key={alert.id}
                  className={`rounded-xl p-5 border ${alertColors[alert.type]} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${alertIconColors[alert.type]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <AlertTypeBadge type={alert.type} />
                          <p className="font-medium text-foreground mt-2">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{alert.division} Division</span>
                            <span>•</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleView(alert.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
