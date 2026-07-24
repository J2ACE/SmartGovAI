import { BarChart3, TrendingUp, Users, CheckCircle, MapPin } from 'lucide-react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { 
  divisionComplaints, 
  statusDistribution, 
  monthlyTrend, 
  predictionVsActual,
  mockContractors 
} from '@/lib/mockData';

// Sample issue locations for the map (replace with real data)
const issueLocations = [
  { id: 1, position: { lat: 28.6139, lng: 77.2090 }, severity: 'high', count: 15 },
  { id: 2, position: { lat: 28.6289, lng: 77.2065 }, severity: 'medium', count: 8 },
  { id: 3, position: { lat: 28.6169, lng: 77.2295 }, severity: 'high', count: 12 },
  { id: 4, position: { lat: 28.6089, lng: 77.1950 }, severity: 'low', count: 5 },
  { id: 5, position: { lat: 28.6339, lng: 77.2190 }, severity: 'medium', count: 9 },
  { id: 6, position: { lat: 28.6239, lng: 77.1890 }, severity: 'high', count: 18 },
  { id: 7, position: { lat: 28.6189, lng: 77.2150 }, severity: 'medium', count: 7 },
  { id: 8, position: { lat: 28.6439, lng: 77.2090 }, severity: 'low', count: 4 },
];

export default function Analytics() {
  const maxMonthly = Math.max(...monthlyTrend.map(m => m.complaints));
  const totalComplaints = Object.values(divisionComplaints).reduce((a, b) => a + b, 0);

  const divisionPerformance = [
    { division: 'North', resolved: 89, avgSLA: '2.1 days' },
    { division: 'South', resolved: 92, avgSLA: '1.8 days' },
    { division: 'East', resolved: 85, avgSLA: '2.4 days' },
    { division: 'West', resolved: 88, avgSLA: '2.0 days' },
    { division: 'Central', resolved: 94, avgSLA: '1.5 days' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Complaints</p>
              <p className="text-3xl font-bold text-foreground">{totalComplaints}</p>
              <p className="text-xs text-success mt-1">↑ 12% this month</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
              <p className="text-3xl font-bold text-foreground">89%</p>
              <p className="text-xs text-success mt-1">↑ 3% improvement</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg SLA</p>
              <p className="text-3xl font-bold text-foreground">2.1d</p>
              <p className="text-xs text-success mt-1">↓ 0.3 days faster</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-info" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Contractors</p>
              <p className="text-3xl font-bold text-foreground">{mockContractors.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {mockContractors.filter(c => c.status === 'Active').length} available
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ward-wise Distribution */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Ward-wise Issue Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(divisionComplaints).map(([division, count]) => (
                <div key={division} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{division}</span>
                    <span className="text-muted-foreground">{count} issues</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${(count / totalComplaints) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Division Performance */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Division-wise Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {divisionPerformance.map((div) => (
                <div key={div.division} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{div.division}</p>
                    <p className="text-xs text-muted-foreground">Avg SLA: {div.avgSLA}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${div.resolved >= 90 ? 'text-success' : 'text-warning'}`}>
                      {div.resolved}%
                    </p>
                    <p className="text-xs text-muted-foreground">resolved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Hotspot Map */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Issue Hotspot Map</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time visualization of complaint locations and density across the city
          </p>
        </div>
        <div className="p-6">
          <div className="h-[500px] rounded-lg overflow-hidden">
            <Map
              defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
              defaultZoom={12}
              mapId="bf51a910020fa25a"
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {issueLocations.map((location) => (
                <AdvancedMarker
                  key={location.id}
                  position={location.position}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg ${
                      location.severity === 'high'
                        ? 'bg-red-500'
                        : location.severity === 'medium'
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{
                      border: '2px solid white',
                    }}
                  >
                    {location.count}
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">High Priority (10+ issues)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-muted-foreground">Medium Priority (5-10 issues)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground">Low Priority (&lt;5 issues)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">Monthly Complaints Trend</h3>
        </div>
        <div className="p-6">
          <div className="flex items-end justify-between gap-4 h-48">
            {monthlyTrend.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center">
                  <span className="text-sm font-medium text-foreground">{month.complaints}</span>
                </div>
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(month.complaints / maxMonthly) * 140}px` }}
                />
                <span className="text-xs text-muted-foreground">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contractor Efficiency */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Contractor Efficiency</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contractor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Jobs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockContractors.slice(0, 5).map((contractor) => (
                  <tr key={contractor.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{contractor.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{contractor.completedJobs}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{contractor.rating}</td>
                    <td className="px-4 py-3">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            contractor.rating >= 4.5 ? 'bg-success' : contractor.rating >= 4 ? 'bg-primary' : 'bg-warning'
                          }`}
                          style={{ width: `${(contractor.rating / 5) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prediction vs Actual */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Prediction vs Actual</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Predicted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {predictionVsActual.map((row) => (
                  <tr key={row.month} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{row.month}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.predicted}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{row.actual}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        row.diff > 0 ? 'text-destructive' : 'text-success'
                      }`}>
                        {row.diff > 0 ? '+' : ''}{row.diff}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
