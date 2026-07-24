import { Phone, Mail, Truck, Users, Activity, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContractorStatusBadge } from '@/components/admin/StatusBadge';
import { useState } from 'react';
import { toast } from 'sonner';

interface Contractor {
  id: string;
  name: string;
  type: string;
  rating: number;
  completedJobs: number;
  activeJobs: number;
  status: string;
  phone: string;
  email: string;
  category?: string;
  contactPhone?: string;
  contactWhatsApp?: string;
  availableMachinery?: string[];
  workersCount?: number;
  workloadIndicator?: string;
}

interface ContractorPanelProps {
  contractors: Contractor[];
  onAssignContractor: (complaintId: string, contractorId: string) => void;
}

export function ContractorPanel({ contractors }: ContractorPanelProps) {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyToClipboard = (text: string, contractorId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(contractorId);
    toast.success('Phone number copied to clipboard');
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'Low':
        return 'text-green-500 bg-green-500/10';
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'High':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden sticky top-6">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Contractor Assignment</h3>
        <p className="text-sm text-muted-foreground">Available contractors for your department</p>
      </div>

      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-3">
        {contractors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No contractors available</p>
          </div>
        ) : (
          contractors.map((contractor) => (
            <div
              key={contractor.id}
              className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm mb-1">{contractor.name}</h4>
                  <p className="text-xs text-muted-foreground">{contractor.type}</p>
                </div>
                <ContractorStatusBadge status={contractor.status as "Active" | "Busy" | "Suspended" | "Flagged"} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Workers</p>
                    <p className="text-sm font-semibold text-foreground">{contractor.workersCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Jobs</p>
                    <p className="text-sm font-semibold text-foreground">{contractor.activeJobs}</p>
                  </div>
                </div>
              </div>

              {/* Workload Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Workload:</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getWorkloadColor(contractor.workloadIndicator || 'Medium')}`}>
                  {contractor.workloadIndicator || 'Medium'}
                </span>
              </div>

              {/* Available Machinery */}
              {contractor.availableMachinery && contractor.availableMachinery.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Equipment:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {contractor.availableMachinery.slice(0, 3).map((machinery, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground"
                      >
                        {machinery}
                      </span>
                    ))}
                    {contractor.availableMachinery.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">
                        +{contractor.availableMachinery.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground flex-1">{contractor.contactPhone || contractor.phone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => copyToClipboard(contractor.contactPhone || contractor.phone, contractor.id)}
                  >
                    {copiedPhone === contractor.id ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{contractor.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => window.open(`tel:${contractor.contactPhone || contractor.phone}`)}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => window.open(`https://wa.me/${(contractor.contactWhatsApp || contractor.phone).replace(/[^0-9]/g, '')}`)}
                >
                  WhatsApp
                </Button>
              </div>

              {/* Manual Assignment Note */}
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  <strong>Note:</strong> Contact manually via phone/WhatsApp
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
