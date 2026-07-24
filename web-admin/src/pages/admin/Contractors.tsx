import { useState, useEffect, useMemo } from 'react';
import { Search, Star, Eye, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContractorStatusBadge } from '@/components/admin/StatusBadge';
import { mockContractors, divisions, Contractor } from '@/lib/mockData';

export default function Contractors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [adminDivision, setAdminDivision] = useState<string>('');

  useEffect(() => {
    // Get the logged-in admin's division
    const division = localStorage.getItem('adminDivision');
    if (division) {
      const capitalizedDivision = division.charAt(0).toUpperCase() + division.slice(1);
      setAdminDivision(capitalizedDivision);
    }
  }, []);

  // Filter contractors by admin's division first
  const divisionContractors = useMemo(() => {
    if (!adminDivision) return mockContractors;
    return mockContractors.filter(contractor => 
      contractor.divisions?.some(div => div.toLowerCase() === adminDivision.toLowerCase())
    );
  }, [adminDivision]);

  const filteredContractors = divisionContractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || contractor.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Local">Local</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Busy">Busy</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contractors Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Divisions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Completed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{contractor.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{contractor.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      contractor.type === 'Government' ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'
                    }`}>
                      {contractor.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contractor.divisions.join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="text-sm">{contractor.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{contractor.completedJobs}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{contractor.activeJobs}</td>
                  <td className="px-4 py-3"><ContractorStatusBadge status={contractor.status} /></td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedContractor(contractor)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contractor Detail Dialog */}
      <Dialog open={!!selectedContractor} onOpenChange={() => setSelectedContractor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contractor Details</DialogTitle>
          </DialogHeader>
          {selectedContractor && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedContractor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedContractor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      selectedContractor.type === 'Government' ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'
                    }`}>
                      {selectedContractor.type}
                    </span>
                    <ContractorStatusBadge status={selectedContractor.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="text-xl font-bold">{selectedContractor.rating}</span>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Completed Jobs</p>
                  <p className="text-xl font-bold mt-1">{selectedContractor.completedJobs}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                  <p className="text-xl font-bold mt-1">{selectedContractor.activeJobs}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Divisions</p>
                  <p className="text-sm font-medium mt-1">{selectedContractor.divisions.join(', ')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Contact Information</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedContractor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedContractor.phone}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Documents</h4>
                <p className="text-sm text-muted-foreground">License, Registration, and other documents verified ✓</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
