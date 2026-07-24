import { useState } from 'react';
import { MapPin, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/admin/StatusBadge';
import { DepartmentComplaint } from '@/types/department';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TaskQueueProps {
  complaints: DepartmentComplaint[];
  onSelectComplaint: (complaint: DepartmentComplaint) => void;
  onAssignWorker: (complaintId: string, workerId: string) => void;
}

// Mock field workers data
const mockWorkers = [
  { id: 'WORKER-1', name: 'Ramesh Kumar', active: true, currentTasks: 2 },
  { id: 'WORKER-2', name: 'Suresh Patel', active: true, currentTasks: 1 },
  { id: 'WORKER-3', name: 'Vijay Singh', active: true, currentTasks: 3 },
  { id: 'WORKER-4', name: 'Prakash Sharma', active: false, currentTasks: 0 },
  { id: 'WORKER-5', name: 'Anil Verma', active: true, currentTasks: 2 },
];

export function TaskQueue({ complaints, onSelectComplaint, onAssignWorker }: TaskQueueProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  // Filter to show only pending or waiting approval
  const pendingComplaints = complaints.filter(
    c => c.status === 'Submitted' || c.status === 'Verified'
  );

  const handleAssignClick = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setAssignDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (selectedComplaintId && selectedWorkerId) {
      onAssignWorker(selectedComplaintId, selectedWorkerId);
      toast.success('Worker assigned successfully');
      setAssignDialogOpen(false);
      setSelectedComplaintId(null);
      setSelectedWorkerId('');
    }
  };

  if (pendingComplaints.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Tasks</h3>
        <p className="text-sm text-muted-foreground">
          All complaints are either assigned or completed. Great job!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Task Queue</h3>
          <p className="text-sm text-muted-foreground">Complaints waiting for action</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Age</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingComplaints.map((complaint) => (
                <tr 
                  key={complaint.id} 
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelectComplaint(complaint)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-primary">{complaint.id}</td>
                  <td className="px-4 py-3">
                    <img 
                      src={complaint.thumbnail} 
                      alt="Issue" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{complaint.damageCategory}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{complaint.ward}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{complaint.age}</td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignClick(complaint.id);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Assign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Worker Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Field Worker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Worker</label>
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a field worker" />
                </SelectTrigger>
                <SelectContent>
                  {mockWorkers
                    .filter(w => w.active)
                    .map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} ({worker.currentTasks} active tasks)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAssignment} disabled={!selectedWorkerId}>
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
