import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  GitBranch, 
  Users, 
  ThumbsUp, 
  FileCheck, 
  MessageSquare, 
  Brain, 
  BarChart3,
  Shield,
  Bell,
  Map,
  Smartphone
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: "Centralized Dashboard",
    desc: "All complaints, contractors, and analytics in one unified interface",
    color: "primary"
  },
  {
    icon: GitBranch,
    title: "Division-based Routing",
    desc: "Automatic routing to North, South, East, West, or Central divisions",
    color: "accent"
  },
  {
    icon: Users,
    title: "Contractor Management",
    desc: "Handle both government and local contractors with ratings & workload",
    color: "success"
  },
  {
    icon: ThumbsUp,
    title: "Upvote Prioritization",
    desc: "Community-driven priority system based on citizen votes",
    color: "info"
  },
  {
    icon: FileCheck,
    title: "Proof & Audit Trail",
    desc: "Complete before/after photo documentation with activity logs",
    color: "warning"
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    desc: "Real-time updates sent directly to citizens via WhatsApp",
    color: "success"
  },
  {
    icon: Brain,
    title: "ML Predictions",
    desc: "AI-powered forecasting for issue hotspots and workload planning",
    color: "primary"
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Comprehensive dashboards with performance metrics and trends",
    color: "accent"
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    desc: "2FA login system for admin access with role-based permissions",
    color: "destructive"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Automated notifications for pending issues and anomalies",
    color: "warning"
  },
  {
    icon: Map,
    title: "Heatmap Visualization",
    desc: "Geographic visualization of issue density and patterns",
    color: "info"
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    desc: "Full functionality on all devices - desktop, tablet, and mobile",
    color: "primary"
  }
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20 hover:border-primary/50" },
  accent: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20 hover:border-accent/50" },
  success: { bg: "bg-success/10", text: "text-success", border: "border-success/20 hover:border-success/50" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20 hover:border-warning/50" },
  info: { bg: "bg-info/10", text: "text-info", border: "border-info/20 hover:border-info/50" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20 hover:border-destructive/50" },
};

export function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" className="py-20 lg:py-32">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 opacity-0",
          isVisible && "animate-fade-in-up"
        )}>
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Smart Governance
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage civic issues efficiently and transparently.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color];
            return (
              <div
                key={index}
                className={cn(
                  "group bg-card rounded-xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 opacity-0",
                  colors.border,
                  isVisible && "animate-scale-up",
                  `animation-delay-${(index % 8) * 100}`
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  colors.bg
                )}>
                  <feature.icon className={cn("w-6 h-6", colors.text)} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
