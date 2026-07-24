import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  MapPin, 
  Bell, 
  ThumbsUp, 
  MessageSquare, 
  Gift,
  LayoutDashboard,
  GitBranch,
  Users,
  ImagePlus,
  Brain,
  Shield
} from 'lucide-react';

const citizenFeatures = [
  { icon: Camera, title: "Live Photo Capture", desc: "Snap issues directly from the app" },
  { icon: MapPin, title: "Auto GPS Location", desc: "Automatic location detection" },
  { icon: Bell, title: "Real-time Tracking", desc: "Track issue status live" },
  { icon: ThumbsUp, title: "Upvote System", desc: "Support community issues" },
  { icon: MessageSquare, title: "WhatsApp Updates", desc: "Get notified via WhatsApp" },
  { icon: Gift, title: "Reward Points", desc: "Earn rewards for reporting" },
];

const adminFeatures = [
  { icon: LayoutDashboard, title: "Centralized Dashboard", desc: "All complaints in one place" },
  { icon: GitBranch, title: "Division-wise Routing", desc: "Auto-assign to N/S/E/W/Central" },
  { icon: Users, title: "Contractor Management", desc: "Gov & local contractor workflow" },
  { icon: ImagePlus, title: "Proof-based Closure", desc: "Before/after photo verification" },
  { icon: Brain, title: "ML Predictions", desc: "AI-powered issue forecasting" },
  { icon: Shield, title: "Audit Trail", desc: "Complete activity logs" },
];

export function SolutionSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="solution" className="py-20 lg:py-32">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 opacity-0",
          isVisible && "animate-fade-in-up"
        )}>
          <span className="inline-block px-4 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium mb-4">
            Our Solution
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            A Complete Platform for Everyone
          </h2>
          <p className="text-lg text-muted-foreground">
            Nivāraṇam bridges the gap between citizens and authorities with powerful tools for both sides.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Citizens Card */}
          <div className={cn(
            "group opacity-0",
            isVisible && "animate-fade-in-up animation-delay-200"
          )}>
            <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20 h-full overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Users className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">For Citizens</h3>
                    <p className="text-sm text-muted-foreground">Easy issue reporting</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {citizenFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-colors opacity-0",
                        isVisible && "animate-scale-up",
                        `animation-delay-${(index + 3) * 100}`
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-foreground">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Admins Card */}
          <div className={cn(
            "group opacity-0",
            isVisible && "animate-fade-in-up animation-delay-400"
          )}>
            <div className="relative bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-8 border border-accent/20 h-full overflow-hidden hover:shadow-xl hover:shadow-accent/10 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                    <LayoutDashboard className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">For Admins</h3>
                    <p className="text-sm text-muted-foreground">Powerful management</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {adminFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-colors opacity-0",
                        isVisible && "animate-scale-up",
                        `animation-delay-${(index + 5) * 100}`
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-foreground">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
