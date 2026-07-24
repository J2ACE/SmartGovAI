import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowLeft, Mail, Lock, Shield, CheckCircle2, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const divisions = [
  { id: 'north', name: 'North Division', color: 'bg-blue-500', email: 'admin.north@nivaran.gov', password: 'North@2025' },
  { id: 'east', name: 'East Division', color: 'bg-green-500', email: 'admin.east@nivaran.gov', password: 'East@2025' },
  { id: 'west', name: 'West Division', color: 'bg-orange-500', email: 'admin.west@nivaran.gov', password: 'West@2025' },
  { id: 'south', name: 'South Division', color: 'bg-purple-500', email: 'admin.south@nivaran.gov', password: 'South@2025' },
  { id: 'central', name: 'Central Division', color: 'bg-red-500', email: 'admin.central@nivaran.gov', password: 'Central@2025' },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'division' | 'credentials'>('division');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    // Get selected role and city from localStorage
    const role = localStorage.getItem('selectedRole');
    const city = localStorage.getItem('selectedCity');
    
    // If role is department-head, redirect to division selection
    // (This page is only for division admins)
    if (role === 'department-head') {
      navigate('/division-selection');
      return;
    }
    
    setSelectedRole(role || '');
    setSelectedCity(city || '');
  }, [navigate]);

  const handleSelectDivision = (divisionId: string) => {
    setSelectedDivision(divisionId);
    setStep('credentials');
    toast.success(`${divisions.find(d => d.id === divisionId)?.name} selected`);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    // Validate credentials for selected division
    const divisionData = divisions.find(d => d.id === selectedDivision);
    if (!divisionData) {
      toast.error('Invalid division selected');
      return;
    }

    if (email !== divisionData.email) {
      toast.error('Invalid email for this division');
      return;
    }

    if (password !== divisionData.password) {
      toast.error('Invalid password');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Store division info for dashboard use
    localStorage.setItem('adminDivision', selectedDivision);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('adminEmail', email);
    
    toast.success('Login successful!');
    
    // Navigate to division admin dashboard
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <img src="/Nivaranam.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Nivāraṇam
            </span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Info Page
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Division Admin Login
              </h1>
              <p className="text-sm text-muted-foreground">
                {step === 'division'
                  ? 'Select your administrative division to continue'
                  : 'Enter your credentials to access the admin dashboard'}
              </p>
              {selectedCity && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>City: <span className="font-semibold text-foreground">{selectedCity}</span></span>
                </div>
              )}
            </div>

            {step === 'division' ? (
              <div className="space-y-4">
                <Label className="text-center block">Select Your Division</Label>
                <div className="grid grid-cols-1 gap-3">
                  {divisions.map((division) => (
                    <button
                      key={division.id}
                      onClick={() => handleSelectDivision(division.id)}
                      className="group relative flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className={`w-12 h-12 rounded-lg ${division.color} flex items-center justify-center`}>
                        <Navigation className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {division.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Municipal Division
                        </p>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
                    </button>
                  ))}
                </div>
              </div>
            ) : step === 'credentials' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-primary text-sm mb-4">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Division: {divisions.find(d => d.id === selectedDivision)?.name}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@nivaran.gov"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('division')}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Change division
                </button>
              </form>
            ) : null}
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Demo Credentials
            </h3>
            <div className="space-y-2 text-xs">
              {divisions.map((div) => (
                <div key={div.id} className="flex flex-col gap-1 pb-2 border-b border-border last:border-0 last:pb-0">
                  <span className="font-medium text-foreground">{div.name}</span>
                  <span className="text-muted-foreground">Email: {div.email}</span>
                  <span className="text-muted-foreground">Password: {div.password}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            This portal is only for authorized municipal administrators.
            <br />
            Unauthorized access is prohibited and monitored.
          </p>
        </div>
      </main>
    </div>
  );
}
