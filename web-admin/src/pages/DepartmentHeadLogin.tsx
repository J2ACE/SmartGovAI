import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Department Head credentials by division
const deptHeadCredentials = {
  north: { email: 'dh.north@cityfix.gov', password: 'North@123' },
  east: { email: 'dh.east@cityfix.gov', password: 'East@123' },
  west: { email: 'dh.west@cityfix.gov', password: 'West@123' },
  south: { email: 'dh.south@cityfix.gov', password: 'South@123' },
  central: { email: 'dh.central@cityfix.gov', password: 'Central@123' },
};

export default function DepartmentHeadLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [division, setDivision] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const adminDivision = localStorage.getItem('adminDivision');
    const selectedDepartment = localStorage.getItem('selectedDepartment');
    
    if (!adminDivision || !selectedDepartment) {
      navigate('/role-selection');
      return;
    }
    
    setDivision(adminDivision);
    setDepartment(selectedDepartment);
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const credentials = deptHeadCredentials[division as keyof typeof deptHeadCredentials];
      
      if (credentials && email === credentials.email && password === credentials.password) {
        // Store authentication
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('adminEmail', email);
        
        console.log('✅ Department Head Login Successful:', {
          division,
          department,
          email
        });
        
        // Navigate to department dashboard
        navigate('/admin/dept-dashboard');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 800);
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
          <Link to="/department-selection" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Department Head Login</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to continue
              </p>
            </div>

            {/* Context Info */}
            <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Division:</span>
                <span className="font-semibold text-foreground capitalize">{division}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold text-foreground capitalize">{department}</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="dh.division@cityfix.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</p>
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <code className="text-foreground">dh.{division}@cityfix.gov</code>
                </div>
                <div className="flex justify-between">
                  <span>Password:</span>
                  <code className="text-foreground">{division.charAt(0).toUpperCase() + division.slice(1)}@123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
