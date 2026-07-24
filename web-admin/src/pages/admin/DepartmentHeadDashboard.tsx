import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Users, Building2 } from 'lucide-react';
import { 
  DepartmentStats,
  TaskQueue,
  WorkProgressPanel,
  ReportsAnalytics,
  ContractorPanel
} from '@/components/department';
import { mockComplaints, mockContractors } from '@/lib/mockData';
import { DepartmentComplaint } from '@/types/department';

export default function DepartmentHeadDashboard() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<DepartmentComplaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get context from localStorage
    const city = localStorage.getItem('selectedCity');
    const division = localStorage.getItem('adminDivision');
    const department = localStorage.getItem('selectedDepartment');
    const role = localStorage.getItem('selectedRole');

    console.log('DepartmentHeadDashboard - Context Check:', { city, division, department, role });

    if (!city || !division || !department || role !== 'department-head') {
      console.warn('DepartmentHeadDashboard - Missing required context, redirecting to city-selection');
      navigate('/city-selection');
      return;
    }

    setSelectedCity(city);
    setSelectedDivision(division.charAt(0).toUpperCase() + division.slice(1));
    setSelectedDepartment(department);
    setUserRole(role);
    setLoading(false);
    
    console.log('DepartmentHeadDashboard - Successfully loaded for:', { 
      city, 
      division: division.charAt(0).toUpperCase() + division.slice(1), 
      department, 
      role 
    });
  }, [navigate]);

  // Map department to complaint categories
  const getDepartmentCategories = (dept: string): string[] => {
    const categoryMap: Record<string, string[]> = {
      road: ['Pothole', 'Road Damage'],
      sanitation: ['Garbage', 'Sewage'],
      water: ['Water Supply', 'Drainage'],
      electricity: ['Streetlight']
    };
    return categoryMap[dept] || [];
  };

  // Get department display name
  const getDepartmentName = (deptId: string) => {
    const deptMap: Record<string, string> = {
      road: 'Dept. of Road',
      sanitation: 'Dept. of Sanitation & Waste Management',
      water: 'Dept. of Water Supply & Sewage',
      electricity: 'Dept. of Electricity & Energy'
    };
    return deptMap[deptId] || deptId;
  };

  // Calculate complaint age
  const calculateAge = (submittedAt: string): string => {
    const now = new Date();
    const submitted = new Date(submittedAt);
    const diffMs = now.getTime() - submitted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Filter complaints by department and division
  const departmentComplaints = useMemo((): DepartmentComplaint[] => {
    const categories = getDepartmentCategories(selectedDepartment);
    
    return mockComplaints
      .filter(complaint => 
        categories.includes(complaint.category) &&
        complaint.division.toLowerCase() === selectedDivision.toLowerCase()
      )
      .map((complaint, index) => {
        // Enhance with department-specific fields
        const now = new Date();
        const submittedDate = new Date(complaint.submittedAt);
        const hoursAgo = (now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60);
        
        return {
          ...complaint,
          department: selectedDepartment,
          damageCategory: complaint.category,
          assignedWorkerId: complaint.status === 'Assigned' || complaint.status === 'In Progress' ? `WORKER-${(index % 5) + 1}` : undefined,
          slaDueAt: new Date(submittedDate.getTime() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours SLA
          inspectionStatus: complaint.status === 'Completed' ? 'inspected' : 
                           complaint.status === 'In Progress' ? 'pending_inspection' : 'not_inspected',
          fieldPhotos: complaint.status === 'In Progress' || complaint.status === 'Completed' 
            ? ['/placeholder.svg', '/placeholder.svg'] 
            : [],
          notes: [
            {
              author: complaint.userName,
              text: complaint.description,
              timestamp: complaint.submittedAt
            }
          ],
          resolutionTime: complaint.status === 'Completed' ? Math.floor(hoursAgo) : undefined,
          age: calculateAge(complaint.submittedAt)
        };
      });
  }, [selectedDepartment, selectedDivision]);

  // Filter contractors by department
  const departmentContractors = useMemo(() => {
    return mockContractors
      .filter(contractor => 
        contractor.divisions.some(div => div.toLowerCase() === selectedDivision.toLowerCase())
      )
      .map(contractor => ({
        ...contractor,
        category: selectedDepartment,
        contactPhone: contractor.phone,
        contactWhatsApp: contractor.phone,
        availableMachinery: ['Jetting', 'Suction', 'Van', 'Truck'],
        workersCount: contractor.activeJobs * 2,
        workloadIndicator: contractor.activeJobs > 5 ? 'High' : contractor.activeJobs > 2 ? 'Medium' : 'Low'
      }));
  }, [selectedDepartment, selectedDivision]);

  const handleComplaintSelect = (complaint: DepartmentComplaint) => {
    setSelectedComplaint(complaint);
  };

  const handleAssignWorker = (complaintId: string, workerId: string) => {
    // Update complaint in state (in real app, this would be an API call)
    console.log(`Assigning complaint ${complaintId} to worker ${workerId}`);
  };

  const handleAssignContractor = (complaintId: string, contractorId: string) => {
    // Update complaint in state (in real app, this would be an API call)
    console.log(`Assigning complaint ${complaintId} to contractor ${contractorId}`);
  };

  const handleStatusChange = (complaintId: string, newStatus: string) => {
    // Update complaint status (in real app, this would be an API call)
    console.log(`Changing complaint ${complaintId} status to ${newStatus}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Head Context Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {getDepartmentName(selectedDepartment)}
            </h2>
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
                <span className="font-semibold text-foreground">{selectedDivision}</span>
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

      {/* Department-Specific Stats */}
      <DepartmentStats complaints={departmentComplaints} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Task Queue and Work Progress */}
        <div className="lg:col-span-2 space-y-6">
          <TaskQueue 
            complaints={departmentComplaints}
            onSelectComplaint={handleComplaintSelect}
            onAssignWorker={handleAssignWorker}
          />
          
          {selectedComplaint && (
            <WorkProgressPanel
              complaint={selectedComplaint}
              onStatusChange={handleStatusChange}
              onAssignContractor={handleAssignContractor}
            />
          )}
        </div>

        {/* Right Column - Contractor Panel */}
        <div>
          <ContractorPanel 
            contractors={departmentContractors}
            onAssignContractor={handleAssignContractor}
          />
        </div>
      </div>

      {/* Reports & Analytics */}
      <ReportsAnalytics 
        complaints={departmentComplaints}
        department={selectedDepartment}
      />
    </div>
  );
}
