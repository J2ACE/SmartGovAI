import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Phone, 
  Clock, 
  ThumbsUp,
  CheckCircle,
  XCircle,
  Copy,
  Star,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge, PriorityBadge, ContractorStatusBadge } from '@/components/admin/StatusBadge';
import { mockComplaints, mockContractors } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const timelineSteps = [
  { status: 'Submitted', completed: true },
  { status: 'Verified', completed: true },
  { status: 'Assigned', completed: true },
  { status: 'Contractor Accepted', completed: true },
  { status: 'Work Started', completed: false },
  { status: 'Work Completed', completed: false },
  { status: 'Admin Approved', completed: false },
  { status: 'Closed', completed: false },
];

export default function ComplaintDetail() {
  const { id } = useParams();
  const complaint = mockComplaints.find(c => c.id === id) || mockComplaints[0];
  const relevantContractors = mockContractors.filter(c => 
    c.divisions.includes(complaint.division) && c.status !== 'Suspended'
  );

  const handleAction = (action: string) => {
    toast.success(`${action} action performed successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/complaints">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{complaint.id}</h1>
          <p className="text-sm text-muted-foreground">{complaint.category} • {complaint.division} Division</p>
        </div>
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Photo & Description */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Issue Photo</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                  ML Detected: {complaint.category}
                </span>
              </div>
              <p className="text-foreground">{complaint.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {complaint.upvotes} upvotes
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(complaint.submittedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </h3>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
              <p className="text-muted-foreground">Map Preview</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {complaint.division} Division • {complaint.ward}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Lat: {complaint.location.lat}, Lng: {complaint.location.lng}
            </p>
          </div>

          {/* Admin Actions */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Admin Actions</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <Button 
                variant="success" 
                className="gap-2"
                onClick={() => handleAction('Approve')}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button 
                variant="destructive" 
                className="gap-2"
                onClick={() => handleAction('Reject')}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleAction('Mark Duplicate')}
              >
                <Copy className="w-4 h-4" />
                Mark Duplicate
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rejection Reason / Notes</label>
              <Textarea placeholder="Enter reason if rejecting or marking as duplicate..." />
            </div>
          </div>

          {/* Contractor Assignment */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Assign Contractor</h3>
              <Button variant="accent" onClick={() => handleAction('Auto-Assign')}>
                Auto-Assign (Recommended)
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contractor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Workload</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {relevantContractors.map((contractor) => (
                    <tr key={contractor.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{contractor.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{contractor.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          <span className="text-sm">{contractor.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{contractor.activeJobs} active</td>
                      <td className="px-4 py-3"><ContractorStatusBadge status={contractor.status} /></td>
                      <td className="px-4 py-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleAction(`Assign to ${contractor.name}`)}
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* User Details */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              User Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{complaint.userName}</p>
                  <p className="text-sm text-muted-foreground">Verified User</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{complaint.userPhone}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Past Complaints</p>
                <p className="text-lg font-semibold text-foreground">12</p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Status Timeline
            </h3>
            <div className="space-y-4">
              {timelineSteps.map((step, index) => (
                <div key={step.status} className="flex items-start gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    step.completed ? 'bg-success' : 'bg-muted'
                  )}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-success-foreground" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-medium',
                      step.completed ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.status}
                    </p>
                    {step.completed && (
                      <p className="text-xs text-muted-foreground">Jan 15, 2024 10:30 AM</p>
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={cn(
                      'absolute left-3 mt-6 w-0.5 h-8',
                      step.completed ? 'bg-success' : 'bg-muted'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
