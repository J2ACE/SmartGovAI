import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Navigation, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const departments = [
  {
    id: 'road',
    name: 'Dept. of Road',
    description: 'Manage road construction, maintenance, and pothole repairs',
    icon: '🛣️',
    color: 'bg-orange-500',
  },
  {
    id: 'sanitation',
    name: 'Dept. of Sanitation & Waste Management',
    description: 'Handle garbage collection, waste disposal, and cleanliness',
    icon: '🗑️',
    color: 'bg-green-500',
  },
  {
    id: 'water',
    name: 'Dept. of Water Supply & Sewage',
    description: 'Oversee water distribution and sewage management',
    icon: '💧',
    color: 'bg-blue-500',
  },
  {
    id: 'electricity',
    name: 'Dept. of Electricity & Energy',
    description: 'Manage streetlights, power supply, and energy infrastructure',
    icon: '⚡',
    color: 'bg-yellow-500',
  },
];

export default function DepartmentSelection() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    // Get previous selections from localStorage
    const city = localStorage.getItem('selectedCity');
    const division = localStorage.getItem('adminDivision');
    const role = localStorage.getItem('selectedRole');

    if (!city || !division || role !== 'department-head') {
      // Redirect if required data is missing or role is not department head
      navigate('/city-selection');
      return;
    }

    setSelectedCity(city);
    setSelectedDivision(division.charAt(0).toUpperCase() + division.slice(1));
    setSelectedRole(role);
  }, [navigate]);

  const handleDepartmentSelect = (departmentId: string) => {
    // Store selected department in localStorage
    localStorage.setItem('selectedDepartment', departmentId);
    
    console.log('DepartmentSelection - Navigating to login with:', {
      city: localStorage.getItem('selectedCity'),
      division: localStorage.getItem('adminDivision'),
      department: departmentId,
      role: localStorage.getItem('selectedRole')
    });
    
    // Navigate to department head login
    navigate('/department-head-login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold text-foreground">
              Nivāraṇam
            </span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/division-selection" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Division
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          {/* Department Selection Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Select Department</h1>
              <p className="text-sm text-muted-foreground">
                Choose the department you oversee as Department Head
              </p>
            </div>

            {/* Context Display - City, Division, Role */}
            <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">City:</span>
                <span className="font-semibold text-foreground">{selectedCity}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Division:</span>
                <span className="font-semibold text-foreground">{selectedDivision}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Role:</span>
                <span className="font-semibold text-foreground">Department Head</span>
              </div>
            </div>

            {/* Department Cards */}
            <div className="grid md:grid-cols-2 gap-4 mt-8">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDepartmentSelect(dept.id)}
                  className="group relative flex items-start gap-4 p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-lg ${dept.color} flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                    {dept.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                      {dept.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dept.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Help Text */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Select the department that matches your administrative responsibility
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
