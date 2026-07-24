import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin } from 'lucide-react';

const divisions = [
  { id: 'north', name: 'North Division', color: 'bg-blue-500', icon: '🧭' },
  { id: 'east', name: 'East Division', color: 'bg-green-500', icon: '🌅' },
  { id: 'west', name: 'West Division', color: 'bg-orange-500', icon: '🌄' },
  { id: 'south', name: 'South Division', color: 'bg-purple-500', icon: '🌇' },
  { id: 'central', name: 'Central Division', color: 'bg-red-500', icon: '🏙️' },
];

export default function DivisionSelection() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    const city = localStorage.getItem('selectedCity');
    const role = localStorage.getItem('selectedRole');
    
    if (!city || !role) {
      navigate('/city-selection');
      return;
    }
    
    setSelectedCity(city);
    setSelectedRole(role);
  }, [navigate]);

  const handleDivisionSelect = (divisionId: string) => {
    localStorage.setItem('adminDivision', divisionId);
    
    // For Department Head, go to department selection
    // For Division Admin, go to login
    if (selectedRole === 'department-head') {
      navigate('/department-selection');
    } else {
      navigate('/admin-login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-primary/5">
      <header className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-bold text-foreground">
              Nivāraṇam
            </span>
          </Link>
          <Link to="/role-selection" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Select Division</h1>
              <p className="text-sm text-muted-foreground">
                Choose the division you want to manage
              </p>
            </div>

            {/* City Context */}
            <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Selected City:</span>
              <span className="text-sm font-semibold text-foreground">{selectedCity}</span>
            </div>

            {/* Division Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {divisions.map((division) => (
                <button
                  key={division.id}
                  onClick={() => handleDivisionSelect(division.id)}
                  className="group relative p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105 hover:shadow-lg text-center"
                >
                  <div className={`w-16 h-16 rounded-xl ${division.color} flex items-center justify-center mx-auto mb-4 text-3xl shadow-md`}>
                    {division.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {division.name}
                  </h3>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
