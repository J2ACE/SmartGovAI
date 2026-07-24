import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  Users, 
  Brain,
  CheckCircle,
  Eye,
  MapPin,
  Map as MapIcon,
  Building2,
  Navigation
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge, PriorityBadge, ContractorStatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  dashboardStats, 
  statusDistribution, 
  mockComplaints, 
  mockContractors
} from '@/lib/mockData';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { GoogleHeatmap, HeatmapPoint } from '@/components/GoogleHeatmap';

export default function Dashboard() {
  const [divisionName, setDivisionName] = useState('');
  const [divisionKey, setDivisionKey] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    // Get the division from localStorage
    const division = localStorage.getItem('adminDivision');
    if (division) {
      // Capitalize first letter
      setDivisionName(division.charAt(0).toUpperCase() + division.slice(1));
      setDivisionKey(division.toLowerCase());
    }

    // Get role, city, and department for Department Head
    const role = localStorage.getItem('selectedRole');
    const city = localStorage.getItem('selectedCity');
    const department = localStorage.getItem('selectedDepartment');
    
    setUserRole(role || '');
    setSelectedCity(city || '');
    setSelectedDepartment(department || '');
  }, []);

  // Filter complaints by division
  const divisionComplaints = useMemo(() => {
    if (!divisionName) return mockComplaints;
    return mockComplaints.filter(complaint => 
      complaint.division.toLowerCase() === divisionName.toLowerCase()
    );
  }, [divisionName]);

  // Filter contractors by division
  const divisionContractors = useMemo(() => {
    if (!divisionName) return mockContractors;
    return mockContractors.filter(contractor => 
      contractor.divisions?.some(div => div.toLowerCase() === divisionName.toLowerCase())
    );
  }, [divisionName]);

  // Division-specific map centers and heatmap points
  const divisionMapData = useMemo(() => {
    
    // Map centers for each division (example coordinates for Delhi)
    const centers: Record<string, { lat: number; lng: number }> = {
      north: { lat: 28.7041, lng: 77.1025 },
      south: { lat: 28.5355, lng: 77.2500 },
      east: { lat: 28.6517, lng: 77.2219 },
      west: { lat: 28.6692, lng: 77.1100 },
      central: { lat: 28.6139, lng: 77.2090 }
    };

    // Sample heatmap points for each division
    const heatmapPoints: Record<string, HeatmapPoint[]> = {
      north: [
        { lat: 28.7041, lng: 77.1025, weight: 9 },
        { lat: 28.7141, lng: 77.1125, weight: 7 },
        { lat: 28.6941, lng: 77.0925, weight: 6 },
        { lat: 28.7241, lng: 77.1225, weight: 8 },
        { lat: 28.6841, lng: 77.0825, weight: 5 },
        { lat: 28.7341, lng: 77.1325, weight: 10 }
      ],
      south: [
        { lat: 28.5355, lng: 77.2500, weight: 8 },
        { lat: 28.5455, lng: 77.2600, weight: 6 },
        { lat: 28.5255, lng: 77.2400, weight: 7 },
        { lat: 28.5555, lng: 77.2700, weight: 9 },
        { lat: 28.5155, lng: 77.2300, weight: 5 },
        { lat: 28.5655, lng: 77.2800, weight: 10 }
      ],
      east: [
        { lat: 28.6517, lng: 77.2819, weight: 7 },
        { lat: 28.6617, lng: 77.2919, weight: 9 },
        { lat: 28.6417, lng: 77.2719, weight: 6 },
        { lat: 28.6717, lng: 77.3019, weight: 8 },
        { lat: 28.6317, lng: 77.2619, weight: 5 },
        { lat: 28.6817, lng: 77.3119, weight: 10 }
      ],
      west: [
        { lat: 28.6692, lng: 77.1100, weight: 8 },
        { lat: 28.6792, lng: 77.1200, weight: 6 },
        { lat: 28.6592, lng: 77.1000, weight: 7 },
        { lat: 28.6892, lng: 77.1300, weight: 9 },
        { lat: 28.6492, lng: 77.0900, weight: 5 },
        { lat: 28.6992, lng: 77.1400, weight: 10 }
      ],
      central: [
        { lat: 28.6139, lng: 77.2090, weight: 9 },
        { lat: 28.6239, lng: 77.2190, weight: 7 },
        { lat: 28.6039, lng: 77.1990, weight: 8 },
        { lat: 28.6339, lng: 77.2290, weight: 6 },
        { lat: 28.5939, lng: 77.1890, weight: 10 },
        { lat: 28.6439, lng: 77.2390, weight: 5 }
      ]
    };

    return {
      center: centers[divisionKey] || centers.central,
      points: heatmapPoints[divisionKey] || heatmapPoints.central
    };
  }, [divisionKey]);

  const recentComplaints = divisionComplaints.slice(0, 5);
  const availableContractors = divisionContractors.filter(c => c.status === 'Active' || c.status === 'Busy');

  const totalStatus = Object.values(statusDistribution).reduce((a, b) => a + b, 0);

  const statusColors: Record<string, string> = {
    Submitted: 'bg-muted-foreground',
    Verified: 'bg-info',
    Assigned: 'bg-warning',
    'In Progress': 'bg-accent',
    Completed: 'bg-success',
    Closed: 'bg-primary'
  };

  // Get department display name
  const getDepartmentName = (deptId: string) => {
    const deptMap: Record<string, string> = {
      'road': 'Dept. of Road',
      'sanitation': 'Dept. of Sanitation & Waste Management',
      'water': 'Dept. of Water Supply & Sewage',
      'electricity': 'Dept. of Electricity & Energy'
    };
    return deptMap[deptId] || deptId;
  };

  return (
    <div className="space-y-6">
      {/* Department Head Context Header */}
      {userRole === 'department-head' && selectedDepartment && (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{getDepartmentName(selectedDepartment)}</h2>
              <p className="text-sm text-muted-foreground mb-3">Department Head Dashboard</p>
              
              {/* Context Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-semibold text-foreground">{selectedCity}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Division:</span>
                  <span className="font-semibold text-foreground">{divisionName}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-semibold text-foreground">Department Head</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Division Admin Header */}
      {userRole === 'division-admin' && divisionName && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{divisionName} Division</h2>
              <p className="text-sm text-muted-foreground">Administrative Dashboard</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="New Complaints"
          value={dashboardStats.newComplaints}
          icon={FileText}
          trend={{ value: '+12% from yesterday', isPositive: false }}
          color="primary"
        />
        <StatCard
          title="Active Issues"
          value={dashboardStats.activeIssues}
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="High Priority"
          value={dashboardStats.highPriority}
          icon={AlertTriangle}
          color="destructive"
        />
        <StatCard
          title="Avg Resolution"
          value={dashboardStats.avgResolutionTime}
          icon={Clock}
          trend={{ value: '-0.5 days', isPositive: true }}
          color="success"
        />
        <StatCard
          title="Contractors"
          value={dashboardStats.contractorsAvailable}
          icon={Users}
          color="info"
        />
        <StatCard
          title="Prediction Alerts"
          value={dashboardStats.predictionAlerts}
          icon={Brain}
          color="accent"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-4">Complaints Status</h3>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                <span className="flex-1 text-sm text-muted-foreground">{status}</span>
                <span className="font-medium text-foreground">{count}</span>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColors[status]} rounded-full`}
                    style={{ width: `${(count / totalStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Complaints</span>
              <span className="font-bold text-foreground">{totalStatus}</span>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Complaints</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/complaints">View All</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Division</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-primary">{complaint.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{complaint.category}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{complaint.division}</td>
                    <td className="px-4 py-3"><StatusBadge status={complaint.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={complaint.priority} /></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/complaints/${complaint.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contractor Availability */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Contractor Availability</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/contractors">View All</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableContractors.slice(0, 4).map((contractor) => (
            <div
              key={contractor.id}
              className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{contractor.name}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{contractor.type}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{contractor.activeJobs} active</span>
                </div>
              </div>
              <ContractorStatusBadge status={contractor.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Division Issue Hotspot Map */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {divisionName ? `${divisionName} Division ` : ''}Issue Hotspot Map
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time visualization of reported issues in your division
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/analytics">
              <Eye className="w-4 h-4 mr-1" />
              Detailed View
            </Link>
          </Button>
        </div>
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border">
          <GoogleHeatmap
            center={divisionMapData.center}
            zoom={12}
            points={divisionMapData.points}
          />
        </div>
      </div>
    </div>
  );
}
