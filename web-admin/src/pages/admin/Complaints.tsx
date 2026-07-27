import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, UserPlus, ThumbsUp, Calendar, Download, X } from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { StatusBadge, PriorityBadge } from '@/components/admin/StatusBadge';
import { mockComplaints, complaintStatuses, priorities, categories, mockContractors } from '@/lib/mockData';
import { adminApi } from '@/services/apiClient';
import { toast } from 'sonner';

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [adminDivision, setAdminDivision] = useState<string>('');
  const [complaintsList, setComplaintsList] = useState<any[]>(mockComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    const division = localStorage.getItem('adminDivision');
    if (division) {
      const capitalizedDivision = division.charAt(0).toUpperCase() + division.slice(1);
      setAdminDivision(capitalizedDivision);
    }

    // Fetch dynamic complaints from REST API Gateway
    adminApi.getComplaints().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((item: any) => ({
          id: item.trackingId || item.id || `CMP-${Math.random()}`,
          title: item.title || 'Civic Issue Report',
          category: item.category || 'General',
          status: item.status === 'SUBMITTED' ? 'Submitted' : item.status === 'IN_PROGRESS' ? 'In Progress' : 'Resolved',
          priority: item.priority === 'HIGH' ? 'High' : item.priority === 'EMERGENCY' ? 'Emergency' : 'Medium',
          division: item.divisionId || item.division || 'North',
          address: item.address || 'Municipal Ward Area',
          citizenName: item.citizenName || 'Citizen User',
          createdAt: item.createdAt?.split('T')[0] || '2026-07-24',
          assignedTo: item.assignedOfficerId || 'Unassigned',
          upvotes: item.upvoteCount || 0,
        }));
        setComplaintsList(formatted);
      }
    }).catch((err) => {
      console.warn("Failed loading live complaints, using mock dataset:", err);
    });
  }, []);

  const safeLower = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val).toLowerCase();
  };

  const divisionComplaints = useMemo(() => {
    if (!adminDivision) return complaintsList;
    return complaintsList.filter(complaint => 
      safeLower(complaint?.division) === safeLower(adminDivision)
    );
  }, [adminDivision, complaintsList]);

  const filterByDateRange = (dateStr: string) => {
    if (dateRange === 'all' || !dateStr) return true;
    
    const complaintDate = new Date(dateStr);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - complaintDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (dateRange) {
      case 'today':
        return daysDiff === 0;
      case 'week':
        return daysDiff <= 7;
      case 'month':
        return daysDiff <= 30;
      default:
        return true;
    }
  };

  const filteredComplaints = useMemo(() => {
    const q = safeLower(searchQuery);

    return divisionComplaints.filter((complaint) => {
      if (!complaint) return false;

      const titleStr = safeLower(complaint.title);
      const idStr = safeLower(complaint.id);
      const addrStr = safeLower(complaint.address);
      const citizenStr = safeLower(complaint.citizenName);

      const matchesSearch =
        !q ||
        titleStr.includes(q) ||
        idStr.includes(q) ||
        addrStr.includes(q) ||
        citizenStr.includes(q);

      const matchesDivision =
        divisionFilter === 'all' || safeLower(complaint.division) === safeLower(divisionFilter);

      const matchesStatus =
        statusFilter === 'all' || safeLower(complaint.status).replace(/\s+/g, '-') === safeLower(statusFilter);

      const matchesPriority =
        priorityFilter === 'all' || safeLower(complaint.priority) === safeLower(priorityFilter);

      const matchesCategory =
        categoryFilter === 'all' || safeLower(complaint.category).replace(/\s+/g, '-') === safeLower(categoryFilter);

      const matchesDate = filterByDateRange(complaint.createdAt);

      return (
        matchesSearch &&
        matchesDivision &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesDate
      );
    });
  }, [divisionComplaints, searchQuery, divisionFilter, statusFilter, priorityFilter, categoryFilter, dateRange]);

  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) {
      toast.error('No complaints available to export.');
      return;
    }

    const headers = ['Tracking ID', 'Title', 'Category', 'Division', 'Status', 'Priority', 'Address', 'Upvotes', 'Created Date'];
    const csvRows = [
      headers.join(','),
      ...filteredComplaints.map(c => [
        `"${c.id}"`,
        `"${c.title.replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${c.division}"`,
        `"${c.status}"`,
        `"${c.priority}"`,
        `"${c.address.replace(/"/g, '""')}"`,
        c.upvotes,
        `"${c.createdAt}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartGovAI_Complaints_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Successfully exported complaints dataset to CSV file!');
  };

  const handleOpenAssignModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    setSelectedContractor(complaint.assignedTo !== 'Unassigned' ? complaint.assignedTo : '');
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedComplaint || !selectedContractor) {
      toast.error('Please select a contractor agency.');
      return;
    }

    setComplaintsList(prev => prev.map(c => {
      if (c.id === selectedComplaint.id) {
        return { ...c, assignedTo: selectedContractor, status: 'In Progress' };
      }
      return c;
    }));

    toast.success(`Assigned ${selectedContractor} to complaint ${selectedComplaint.id}! Status updated to In Progress.`);
    setIsAssignDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Management</h1>
          <p className="text-slate-500 font-normal">
            {adminDivision 
              ? `Viewing and managing complaints for ${adminDivision} Division`
              : 'View, filter, and assign contractors to citizen complaints'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-slate-300 hover:bg-slate-100" onClick={handleExportCSV}>
            <Download className="w-4 h-4 text-slate-600" /> Export CSV Data
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search by ID, title, address, or citizen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {complaintStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-[150px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map((priority) => (
                <SelectItem key={priority.id} value={priority.id}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[160px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Agency</th>
                <th className="px-4 py-3">Upvotes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 font-normal">
                    No complaints found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{complaint.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{complaint.title}</div>
                      <div className="text-xs text-slate-500">{complaint.category}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-normal">{complaint.division}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {complaint.assignedTo !== 'Unassigned' ? (
                        <span className="inline-flex items-center gap-1 text-slate-900">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          {complaint.assignedTo}
                        </span>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 gap-1"
                          onClick={() => handleOpenAssignModal(complaint)}
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Assign Contractor
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">👍 {complaint.upvotes}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/complaints/${complaint.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-slate-600 hover:text-slate-900">
                          <Eye className="w-4 h-4" /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contractor Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-white max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Assign Repair Contractor</DialogTitle>
            <DialogDescription className="text-slate-500">
              Select an authorized municipal contractor agency for complaint <strong className="text-slate-800">{selectedComplaint?.id}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contractor Agency</label>
              <Select value={selectedContractor} onValueChange={setSelectedContractor}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select contractor agency..." />
                </SelectTrigger>
                <SelectContent>
                  {mockContractors.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name} ({c.agencyName}) - ⭐ {c.rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAssignment} className="bg-blue-600 hover:bg-blue-700 text-white">
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
