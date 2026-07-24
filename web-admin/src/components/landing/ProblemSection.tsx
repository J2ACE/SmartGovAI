import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { 
  HelpCircle, 
  Search, 
  Clock, 
  AlertTriangle,
  Layers,
  Eye,
  Zap,
  FileQuestion
} from 'lucide-react';

const citizenProblems = [
  { icon: HelpCircle, title: "Don't know where to report", desc: "Multiple departments, no clear process" },
  { icon: Search, title: "No tracking system", desc: "Unable to follow up on submitted issues" },
  { icon: Clock, title: "Long waiting times", desc: "No clarity on expected resolution time" },
  { icon: AlertTriangle, title: "Lack of transparency", desc: "No visibility into issue handling" },
];

const authorityProblems = [
  { icon: Layers, title: "Multiple channels", desc: "Complaints from calls, emails, social media" },
  { icon: Eye, title: "No centralized view", desc: "Scattered data across departments" },
  { icon: Zap, title: "Slow assignment", desc: "Manual routing delays resolution" },
  { icon: FileQuestion, title: "Poor documentation", desc: "Incomplete records for audit" },
];

export function ProblemSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="problem" className="py-20 lg:py-32 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 opacity-0",
          isVisible && "animate-fade-in-up"
        )}>
          <span className="inline-block px-4 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium mb-4">
            The Challenge
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            The Problem with Civic Issue Reporting
          </h2>
          <p className="text-lg text-muted-foreground">
            Both citizens and authorities face significant challenges with traditional civic issue management systems.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Citizens Column */}
          <div className={cn(
            "opacity-0",
            isVisible && "animate-fade-in-up animation-delay-200"
          )}>
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg border border-border h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  For Citizens
                </h3>
              </div>

              <div className="space-y-4">
                {citizenProblems.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors opacity-0",
                      isVisible && "animate-fade-in-up",
                      `animation-delay-${(index + 3) * 100}`
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Authorities Column */}
          <div className={cn(
            "opacity-0",
            isVisible && "animate-fade-in-up animation-delay-400"
          )}>
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg border border-border h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  For Authorities
                </h3>
              </div>

              <div className="space-y-4">
                {authorityProblems.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors opacity-0",
                      isVisible && "animate-fade-in-up",
                      `animation-delay-${(index + 5) * 100}`
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
