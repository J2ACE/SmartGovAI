import { User, Mail, Phone, Shield, Bell, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

const divisionEmails: Record<string, string> = {
  north: 'admin.north@nivaran.gov',
  east: 'admin.east@nivaran.gov',
  west: 'admin.west@nivaran.gov',
  south: 'admin.south@nivaran.gov',
  central: 'admin.central@nivaran.gov',
};

export default function Settings() {
  const [adminEmail, setAdminEmail] = useState('admin@nivaran.gov');
  const [divisionName, setDivisionName] = useState('');

  useEffect(() => {
    // Get the division from localStorage
    const division = localStorage.getItem('adminDivision');
    if (division && divisionEmails[division]) {
      setAdminEmail(divisionEmails[division]);
      setDivisionName(division.charAt(0).toUpperCase() + division.slice(1));
    }
  }, []);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Settings
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">AD</span>
            </div>
            <div>
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={divisionName ? `${divisionName} Division Admin` : 'Admin User'} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={divisionName ? `${divisionName} Division Admin` : 'Super Admin'} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" value={adminEmail} className="pl-9" readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" defaultValue="+91 98765 43210" className="pl-9" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Login Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="pt-4 border-t border-border">
            <Button variant="outline">Change Password</Button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">New Complaints</p>
              <p className="text-sm text-muted-foreground">Notify when new complaints arrive</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">High Priority Alerts</p>
              <p className="text-sm text-muted-foreground">Critical issue notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Prediction Alerts</p>
              <p className="text-sm text-muted-foreground">ML prediction notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Daily Summary</p>
              <p className="text-sm text-muted-foreground">End of day report via email</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            System Preferences
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Compact View</p>
              <p className="text-sm text-muted-foreground">Reduce spacing in tables</p>
            </div>
            <Switch />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" defaultValue="English" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="IST (UTC+5:30)" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
