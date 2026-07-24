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
import { toast } from 'sonner';

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [adminDivision, setAdminDivision] = useState<string>('');

  useEffect(() => {
    // Get the logged-in admin's division
    const division = localStorage.getItem('adminDivision');
    if (division) {
      const capitalizedDivision = division.charAt(0).toUpperCase() + division.slice(1);
      setAdminDivision(capitalizedDivision);
    }
  }, []);

  // Filter complaints by admin's division first
  const divisionComplaints = useMemo(() => {
    if (!adminDivision) return mockComplaints;
    return mockComplaints.filter(complaint => 
      complaint.division.toLowerCase() === adminDivision.toLowerCase()
    );
  }, [adminDivision]);

  // Helper function to filter by date range
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
      case '3months':
        return daysDiff <= 90;
      default:
        return true;
    }
  };

  const filteredComplaints = divisionComplaints.filter(complaint => {
    const matchesSearch = complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision = divisionFilter === 'all' || complaint.division === divisionFilter;
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesDate = filterByDateRange(complaint.date);
    
    return matchesSearch && matchesDivision && matchesStatus && matchesPriority && matchesCategory && matchesDate;
  });

  // Export to CSV function
  const handleExport = () => {
    try {
      // Create CSV header
      const headers = ['ID', 'Category', 'User Name', 'Phone', 'Division', 'Ward', 'Status', 'Priority', 'Date', 'Upvotes'];
      
      // Create CSV rows
      const rows = filteredComplaints.map(complaint => [
        complaint.id,
        complaint.category,
        complaint.userName,
        complaint.userPhone,
        complaint.division,
        complaint.ward,
        complaint.status,
        complaint.priority,
        complaint.date,
        complaint.upvotes
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `complaints_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${filteredComplaints.length} complaints to CSV`);
    } catch (error) {
      toast.error('Failed to export complaints');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, category, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Division Filter */}
          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map(div => (
                <SelectItem key={div} value={div}>{div}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {complaintStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                {dateRange === 'all' ? 'Date Range' : 
                 dateRange === 'today' ? 'Today' :
                 dateRange === 'week' ? 'Last 7 Days' :
                 dateRange === 'month' ? 'Last 30 Days' : 'Last 3 Months'}
                {dateRange !== 'all' && (
                  <X className="w-3 h-3 ml-1" onClick={(e) => { e.stopPropagation(); setDateRange('all'); }} />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-2">
                <button
                  onClick={() => setDateRange('today')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setDateRange('week')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setDateRange('3months')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Last 3 Months
                </button>
                <button
                  onClick={() => setDateRange('all')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors border-t border-border"
                >
                  All Time
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredComplaints.length} of {mockComplaints.length} complaints
        </p>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleExport}
          disabled={filteredComplaints.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Complaints Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Thumbnail</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Division/Ward</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Upvotes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{complaint.id}</td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <img src={complaint.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{complaint.category}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{complaint.userName}</p>
                      <p className="text-xs text-muted-foreground">{complaint.userPhone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-foreground">{complaint.division}</p>
                      <p className="text-xs text-muted-foreground">{complaint.ward}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={complaint.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={complaint.priority} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp className="w-4 h-4" />
                      {complaint.upvotes}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/complaints/${complaint.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-success">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-primary">
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
