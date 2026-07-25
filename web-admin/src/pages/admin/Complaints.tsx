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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { StatusBadge, PriorityBadge } from '@/components/admin/StatusBadge';
import { mockComplaints, divisions, complaintStatuses, priorities, categories } from '@/lib/mockData';
import { adminApi } from '@/lib/api';
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
          id: item.trackingId || item.id,
          title: item.title,
          category: item.category,
          status: item.status === 'SUBMITTED' ? 'Submitted' : item.status === 'IN_PROGRESS' ? 'In Progress' : 'Resolved',
          priority: item.priority === 'HIGH' ? 'High' : item.priority === 'EMERGENCY' ? 'Emergency' : 'Medium',
          division: item.divisionId || 'North',
          address: item.address,
          citizenName: 'Citizen',
          createdAt: item.createdAt?.split('T')[0] || '2026-07-24',
          assignedTo: item.assignedOfficerId || 'Unassigned',
          upvotes: item.upvoteCount || 0,
        }));
        setComplaintsList(formatted);
      }
    });
  }, []);

  const divisionComplaints = useMemo(() => {
    if (!adminDivision) return complaintsList;
    return complaintsList.filter(complaint => 
      complaint.division.toLowerCase() === adminDivision.toLowerCase()
    );
  }, [adminDivision, complaintsList]);

  const filterByDateRange = (dateStr: string) => {
    if (dateRange === 'all') return true;
    
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
    return divisionComplaints.filter((complaint) => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.citizenName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision =
        divisionFilter === 'all' || complaint.division.toLowerCase() === divisionFilter.toLowerCase();
      const matchesStatus =
        statusFilter === 'all' || complaint.status.toLowerCase().replace(' ', '-') === statusFilter.toLowerCase();
      const matchesPriority =
        priorityFilter === 'all' || complaint.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchesCategory =
        categoryFilter === 'all' || complaint.category.toLowerCase().replace(' ', '-') === categoryFilter.toLowerCase();
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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (divisionFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (dateRange !== 'all') count++;
    return count;
  }, [divisionFilter, statusFilter, priorityFilter, categoryFilter, dateRange]);

  const clearAllFilters = () => {
    setDivisionFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setDateRange('all');
    setSearchQuery('');
    toast.info('All filters reset');
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
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Exporting complaints dataset to CSV...')}>
            <Download className="w-4 h-4" /> Export Data
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
                <th className="px-4 py-3">Upvotes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 font-normal">
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
    </div>
  );
}
