import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const roles = [
  {
    id: 'division-admin',
    title: 'Division Admin',
    description: 'Manage complaints and operations for a specific division',
    icon: Shield,
    color: 'bg-blue-500',
  },
  {
    id: 'department-head',
    title: 'Department Head',
    description: 'Oversee department-wide activities and staff',
    icon: Building2,
    color: 'bg-purple-500',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    // Get selected city from localStorage
    const city = localStorage.getItem('selectedCity');
    if (!city) {
      // If no city selected, redirect to city selection
      navigate('/city-selection');
      return;
    }
    setSelectedCity(city);
  }, [navigate]);

  const handleRoleSelect = (roleId: string) => {
    // Store selected role in localStorage
    localStorage.setItem('selectedRole', roleId);
    
    // Department Heads go to division selection (no login yet)
    // Division Admins go to login (with division selection)
    if (roleId === 'department-head') {
      navigate('/division-selection');
    } else {
      navigate('/admin-login');
    }
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
            <Link to="/city-selection" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to City Selection
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Role Selection Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Select Your Role</h1>
              <p className="text-sm text-muted-foreground">
                Choose the role that matches your position
              </p>
            </div>

            {/* Selected City Display */}
            {selectedCity && (
              <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-base">City: <span className="font-semibold text-foreground">{selectedCity}</span></span>
              </div>
            )}

            {/* Role Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="group relative flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className={`w-20 h-20 rounded-xl ${role.color} flex items-center justify-center shadow-lg`}>
                    <role.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <div className="mt-2">
                    <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium group-hover:bg-primary group-hover:text-white transition-colors">
                      Select Role →
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Help Text */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Not sure which role to select? Contact your administrator.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
