import { useState } from 'react';
import { CheckCircle, Clock, FileText, MessageSquare, Image as ImageIcon, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DepartmentComplaint } from '@/types/department';
import { Textarea } from '@/components/ui/textarea';
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

interface WorkProgressPanelProps {
  complaint: DepartmentComplaint;
  onStatusChange: (complaintId: string, newStatus: string) => void;
  onAssignContractor: (complaintId: string, contractorId: string) => void;
}

// Mock contractors for assignment
const mockContractors = [
  { id: 'CONT-1', name: 'Metro Construction Co.', workload: 'Medium' },
  { id: 'CONT-2', name: 'City Works Ltd.', workload: 'High' },
  { id: 'CONT-3', name: 'Quick Fix Services', workload: 'Low' },
];

export function WorkProgressPanel({ complaint, onStatusChange, onAssignContractor }: WorkProgressPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [contractorDialogOpen, setContractorDialogOpen] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      toast.success('Note added successfully');
      setNewNote('');
    }
  };

  const handleContractorAssignment = () => {
    if (selectedContractorId) {
      onAssignContractor(complaint.id, selectedContractorId);
      const contractor = mockContractors.find(c => c.id === selectedContractorId);
      toast.success(`Assigned to ${contractor?.name}. Please contact them manually via phone/WhatsApp.`);
      setContractorDialogOpen(false);
      setSelectedContractorId('');
    }
  };

  // Status timeline steps
  const statusSteps = [
    { label: 'Submitted', status: 'Submitted' },
    { label: 'Verified', status: 'Verified' },
    { label: 'Assigned', status: 'Assigned' },
    { label: 'In Progress', status: 'In Progress' },
    { label: 'Completed', status: 'Completed' }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === complaint.status);

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Work Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">Complaint ID: {complaint.id}</p>
            </div>
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Status Timeline</h4>
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" style={{ zIndex: 0 }}>
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    index <= currentStepIndex 
                      ? 'bg-primary border-primary text-white' 
                      : 'bg-card border-muted text-muted-foreground'
                  }`}>
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 text-center max-w-[80px]">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Inspection Status</p>
              <p className="text-sm font-semibold text-foreground capitalize">
                {complaint.inspectionStatus?.replace('_', ' ')}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Assigned Worker</p>
              <p className="text-sm font-semibold text-foreground">
                {complaint.assignedWorkerId || 'Not assigned'}
              </p>
            </div>
          </div>

          {/* Field Photos */}
          {complaint.fieldPhotos && complaint.fieldPhotos.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Field Photos ({complaint.fieldPhotos.length})
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {complaint.fieldPhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Field photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Notes / Comments */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes & Comments
            </h4>
            <div className="space-y-3 mb-4">
              {complaint.notes?.map((note, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{note.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.text}</p>
                </div>
              ))}
            </div>

            {/* Add Note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note or comment..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddNote} size="sm">
                <FileText className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {complaint.status === 'Verified' && (
              <Button onClick={() => onStatusChange(complaint.id, 'Assigned')}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark as Assigned
              </Button>
            )}
            {complaint.status === 'In Progress' && (
              <Button onClick={() => onStatusChange(complaint.id, 'Completed')}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve Completion
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setContractorDialogOpen(true)}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Assign Contractor
            </Button>
          </div>
        </div>
      </div>

      {/* Contractor Assignment Dialog */}
      <Dialog open={contractorDialogOpen} onOpenChange={setContractorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Contractor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Contractor</label>
              <Select value={selectedContractorId} onValueChange={setSelectedContractorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a contractor" />
                </SelectTrigger>
                <SelectContent>
                  {mockContractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id}>
                      {contractor.name} (Workload: {contractor.workload})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <strong>Note:</strong> After assignment, please contact the contractor manually via phone or WhatsApp to coordinate the work.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContractorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContractorAssignment} disabled={!selectedContractorId}>
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
