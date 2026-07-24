import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Static list of major Indian cities
const indianCities = [
  'Ahmedabad', 'Amritsar', 'Aurangabad', 'Bengaluru', 'Bhopal', 'Bhubaneswar',
  'Chandigarh', 'Chennai', 'Coimbatore', 'Delhi', 'Faridabad', 'Ghaziabad',
  'Gurgaon', 'Guwahati', 'Hyderabad', 'Indore', 'Jaipur', 'Jamshedpur',
  'Jodhpur', 'Kanpur', 'Kochi', 'Kolkata', 'Lucknow', 'Ludhiana',
  'Madurai', 'Mangalore', 'Mumbai', 'Mysore', 'Nagpur', 'Nashik',
  'New Delhi', 'Noida', 'Patna', 'Pune', 'Raipur', 'Rajkot',
  'Ranchi', 'Surat', 'Thane', 'Thiruvananthapuram', 'Vadodara', 'Varanasi',
  'Vijayawada', 'Visakhapatnam'
].sort();

export default function CitySelection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [open, setOpen] = useState(false);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery) return indianCities;
    return indianCities.filter(city =>
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleContinue = () => {
    if (selectedCity) {
      // Store selected city in localStorage
      localStorage.setItem('selectedCity', selectedCity);
      // Navigate to role selection
      navigate('/role-selection');
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
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* City Selection Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Select Your City</h1>
              <p className="text-sm text-muted-foreground">
                Choose the city where you serve as an authorized personnel
              </p>
            </div>

            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for your city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              {/* City Dropdown/Combobox */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-12 justify-between text-base"
                  >
                    {selectedCity ? selectedCity : "Select city from list..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {indianCities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={(currentValue) => {
                              setSelectedCity(currentValue === selectedCity ? "" : city);
                              setOpen(false);
                            }}
                          >
                            <MapPin className="mr-2 h-4 w-4 text-primary" />
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Filtered Cities List (shows when typing in search) */}
              {searchQuery && filteredCities.length > 0 && (
                <div className="border border-border rounded-lg max-h-60 overflow-y-auto">
                  {filteredCities.slice(0, 10).map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                        selectedCity === city ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{city}</span>
                    </button>
                  ))}
                  {filteredCities.length > 10 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground text-center border-t border-border">
                      +{filteredCities.length - 10} more cities
                    </div>
                  )}
                </div>
              )}

              {searchQuery && filteredCities.length === 0 && (
                <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
                  No cities found matching "{searchQuery}"
                </div>
              )}

              {/* Selected City Display */}
              {selectedCity && (
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Selected City</p>
                    <p className="font-semibold text-foreground">{selectedCity}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!selectedCity}
              className="w-full h-12 text-base"
            >
              Continue to Role Selection
            </Button>

            {/* Help Text */}
            <p className="text-center text-xs text-muted-foreground">
              Can't find your city? Please contact support for assistance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
