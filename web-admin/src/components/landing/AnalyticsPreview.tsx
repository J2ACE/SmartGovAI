import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { divisionComplaints, statusDistribution } from "@/lib/mockData";
import { useMemo } from "react";
import { GoogleHeatmap, HeatmapPoint } from "@/components/GoogleHeatmap";

export function AnalyticsPreview() {
  const { ref, isVisible } = useScrollAnimation();

  // Center for the city-wide preview map
  const cityCenter = { lat: 28.6139, lng: 77.209 }; // Delhi

  // Sample heatmap points for the preview
  const cityHeatmapPoints: HeatmapPoint[] = [
    { lat: 28.6139, lng: 77.209, weight: 8 },
    { lat: 28.6289, lng: 77.2065, weight: 6 },
    { lat: 28.6169, lng: 77.2295, weight: 9 },
    { lat: 28.6089, lng: 77.195, weight: 4 },
    { lat: 28.6339, lng: 77.219, weight: 7 },
    { lat: 28.6239, lng: 77.189, weight: 10 },
    { lat: 28.6189, lng: 77.215, weight: 5 },
    { lat: 28.6439, lng: 77.209, weight: 3 },
  ];

  const maxComplaints = Math.max(...Object.values(divisionComplaints));
  const totalStatus = Object.values(statusDistribution).reduce((a, b) => a + b, 0);

  const statusColors: Record<string, string> = {
    Submitted: "bg-muted-foreground",
    Verified: "bg-info",
    Assigned: "bg-warning",
    "In Progress": "bg-accent",
    Completed: "bg-success",
    Closed: "bg-primary",
  };

  return (
    <section id="analytics" className="py-20 lg:py-32 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 opacity-0",
            isVisible && "animate-fade-in-up"
          )}
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Analytics Preview
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Data-Driven Insights
          </h2>
          <p className="text-lg text-muted-foreground">
            Get a glimpse of the powerful analytics dashboard available to administrators.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bar Chart - Division Complaints */}
          <div
            className={cn(
              "bg-card rounded-2xl p-6 shadow-lg border border-border opacity-0",
              isVisible && "animate-fade-in-up animation-delay-200"
            )}
          >
            <h3 className="font-semibold text-foreground mb-6">
              Complaints by Division
            </h3>
            <div className="space-y-4">
              {Object.entries(divisionComplaints).map(([division, count]) => (
                <div key={division} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{division}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000"
                      style={{
                        width: isVisible
                          ? `${(count / maxComplaints) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut Chart - Status Distribution */}
          <div
            className={cn(
              "bg-card rounded-2xl p-6 shadow-lg border border-border opacity-0",
              isVisible && "animate-fade-in-up animation-delay-400"
            )}
          >
            <h3 className="font-semibold text-foreground mb-6">
              Status Distribution
            </h3>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {(() => {
                  let currentOffset = 0;
                  return Object.entries(statusDistribution).map(
                    ([status, count]) => {
                      const percentage = (count / totalStatus) * 100;
                      const strokeDasharray = `${percentage} ${100 - percentage}`;
                      const element = (
                        <circle
                          key={status}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={-currentOffset}
                          className={cn(
                            statusColors[status],
                            "transition-all duration-1000"
                          )}
                          style={{ opacity: isVisible ? 1 : 0 }}
                        />
                      );
                      currentOffset += percentage;
                      return element;
                    }
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {totalStatus}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2 text-xs">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      statusColors[status]
                    )}
                  />
                  <span className="text-muted-foreground truncate">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Preview */}
          <div
            className={cn(
              "bg-card rounded-2xl p-6 shadow-lg border border-border opacity-0",
              isVisible && "animate-fade-in-up animation-delay-600"
            )}
          >
            <h3 className="font-semibold text-foreground mb-2">
              City-wide Issue Hotspot Map
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Real-time visualization of reported civic issues across the city.
            </p>

            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border">
              <GoogleHeatmap
                center={cityCenter}
                zoom={11}
                points={cityHeatmapPoints}
                mapId="bf51a910020fa25a"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
