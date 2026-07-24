import { useState } from 'react';
import { Search, Star, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContractorStatusBadge } from '@/components/admin/StatusBadge';
import { mockContractors } from '@/lib/mockData';
import { toast } from 'sonner';

export default function LocalContractors() {
  const [searchQuery, setSearchQuery] = useState('');

  const localContractors = mockContractors.filter(c => c.type === 'Local');
  
  const filteredContractors = localContractors.filter(contractor => 
    contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (name: string) => {
    toast.success(`${name} has been approved`);
  };

  const handleSuspend = (name: string) => {
    toast.warning(`${name} has been suspended`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">Total Local</p>
          <p className="text-2xl font-bold text-foreground">{localContractors.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-success">{localContractors.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">Flagged</p>
          <p className="text-2xl font-bold text-destructive">{localContractors.filter(c => c.status === 'Flagged').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <p className="text-2xl font-bold text-accent">
            {(localContractors.reduce((a, c) => a + c.rating, 0) / localContractors.length).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search local contractors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Contractors List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContractors.map((contractor) => (
          <div 
            key={contractor.id}
            className={`bg-card rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${
              contractor.status === 'Flagged' ? 'border-destructive/50' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-accent-foreground">
                    {contractor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{contractor.name}</h3>
                  <p className="text-xs text-muted-foreground">{contractor.id}</p>
                </div>
              </div>
              <ContractorStatusBadge status={contractor.status} />
            </div>

            {contractor.status === 'Flagged' && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Low rating - Review required</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className={`w-4 h-4 ${contractor.rating >= 4 ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                  <span className="font-medium">{contractor.rating}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="font-medium mt-1">{contractor.completedJobs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
                <p className="font-medium mt-1">{contractor.activeJobs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Divisions</p>
                <p className="font-medium mt-1 text-sm">{contractor.divisions.join(', ')}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {contractor.status === 'Flagged' || contractor.status === 'Suspended' ? (
                <Button 
                  variant="success" 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => handleApprove(contractor.name)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
              ) : (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => handleSuspend(contractor.name)}
                >
                  <XCircle className="w-4 h-4" />
                  Suspend
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
