import { Brain, AlertTriangle, TrendingUp, MapPin, Users } from 'lucide-react';
import { predictionData, divisionComplaints } from '@/lib/mockData';

export default function Predictions() {
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Next Week</p>
              <p className="text-3xl font-bold text-foreground">{predictionData.nextWeekTotal}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ML model predicts {predictionData.nextWeekTotal} complaints in the coming week
          </p>
        </div>

        <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl p-6 border border-destructive/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High-Risk Hotspots</p>
              <p className="text-3xl font-bold text-foreground">{predictionData.hotspots.length}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Areas requiring immediate attention
          </p>
        </div>

        <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl p-6 border border-warning/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center">
              <Users className="w-6 h-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departments at Risk</p>
              <p className="text-3xl font-bold text-foreground">
                {predictionData.departmentLoad.filter(d => d.load === 'High').length}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Departments likely to be overloaded
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hotspot Zones */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-destructive" />
              High-Risk Hotspots
            </h3>
          </div>
          <div className="p-6">
            {/* Visual Heatmap */}
            <div className="relative aspect-video bg-gradient-to-br from-secondary to-muted rounded-xl overflow-hidden mb-6">
              <div className="absolute inset-0">
                <div className="absolute top-[15%] left-[25%] w-24 h-24 bg-destructive/70 rounded-full blur-2xl animate-pulse" />
                <div className="absolute top-[45%] right-[20%] w-20 h-20 bg-warning/60 rounded-full blur-2xl animate-pulse animation-delay-200" />
                <div className="absolute bottom-[25%] left-[40%] w-16 h-16 bg-accent/70 rounded-full blur-2xl animate-pulse animation-delay-400" />
              </div>
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="border border-border/20" />
                ))}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground">Complaint Density</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Low</span>
                  <div className="w-16 h-2 bg-gradient-to-r from-success via-warning to-destructive rounded-full" />
                  <span className="text-muted-foreground">High</span>
                </div>
              </div>
            </div>

            {/* Hotspot List */}
            <div className="space-y-3">
              {predictionData.hotspots.map((hotspot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-destructive' : index === 1 ? 'bg-warning' : 'bg-accent'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{hotspot.ward}</p>
                      <p className="text-sm text-muted-foreground">{hotspot.division} Division</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{hotspot.predicted}</p>
                    <p className="text-xs text-muted-foreground">predicted</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Load */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              Department Workload Prediction
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {predictionData.departmentLoad.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{dept.dept}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      dept.load === 'High' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {dept.load} Load
                    </span>
                  </div>
                  <span className="font-bold text-foreground">{dept.predicted}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.load === 'High' ? 'bg-destructive' : 'bg-warning'
                    }`}
                    style={{ width: `${(dept.predicted / 50) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-3">Division Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(divisionComplaints).map(([division, count]) => (
                  <div key={division} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{division}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(count / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Notes */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          ML Model Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary mb-1">Seasonal Pattern</p>
            <p className="text-sm text-muted-foreground">
              20% increase in water-related complaints expected during summer months
            </p>
          </div>
          <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
            <p className="text-sm font-medium text-warning mb-1">Weather Impact</p>
            <p className="text-sm text-muted-foreground">
              Monsoon season correlates with 35% rise in drainage issues
            </p>
          </div>
          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <p className="text-sm font-medium text-success mb-1">Model Accuracy</p>
            <p className="text-sm text-muted-foreground">
              Current prediction accuracy: 87% based on historical data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
