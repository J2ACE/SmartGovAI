import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  MapPin, 
  CheckCircle, 
  UserCheck, 
  Wrench, 
  ImagePlus, 
  ThumbsUp,
  Database
} from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: "Citizen Submits",
    desc: "Photo + GPS location captured automatically"
  },
  {
    icon: MapPin,
    title: "Division Routing",
    desc: "Nearest division receives issue based on GPS"
  },
  {
    icon: CheckCircle,
    title: "Admin Verifies",
    desc: "Approve, reject, or mark as duplicate"
  },
  {
    icon: UserCheck,
    title: "Contractor Assigned",
    desc: "Government or local contractor gets the task"
  },
  {
    icon: Wrench,
    title: "Work in Progress",
    desc: "Contractor works on the issue"
  },
  {
    icon: ImagePlus,
    title: "Photo Proof",
    desc: "Before & after photos uploaded"
  },
  {
    icon: ThumbsUp,
    title: "Admin Approves",
    desc: "Completion verified by admin"
  },
  {
    icon: Database,
    title: "Data Stored",
    desc: "Complete audit trail for ML analytics"
  }
];

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={cn(
          "text-center max-w-3xl mx-auto mb-16 opacity-0",
          isVisible && "animate-fade-in-up"
        )}>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Process Flow
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A streamlined 8-step process from issue submission to resolution and analytics.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full -translate-y-1/2" />
          
          <div className="grid grid-cols-8 gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex flex-col items-center opacity-0",
                  isVisible && "animate-scale-up",
                  `animation-delay-${index * 100}`
                )}
              >
                {/* Step Number */}
                <div className={cn(
                  "relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110",
                  index % 2 === 0 
                    ? "bg-primary text-primary-foreground mb-4" 
                    : "bg-accent text-accent-foreground mt-4 order-2"
                )}>
                  <step.icon className="w-7 h-7" />
                  <span className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-primary text-xs font-bold flex items-center justify-center text-foreground">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className={cn(
                  "text-center",
                  index % 2 !== 0 && "order-1"
                )}>
                  <h4 className="font-semibold text-sm text-foreground mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary" />
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex items-start gap-6 opacity-0",
                  isVisible && "animate-fade-in-up",
                  `animation-delay-${index * 100}`
                )}
              >
                <div className={cn(
                  "relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0",
                  index % 2 === 0 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-accent text-accent-foreground"
                )}>
                  <step.icon className="w-7 h-7" />
                  <span className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-primary text-xs font-bold flex items-center justify-center text-foreground">
                    {index + 1}
                  </span>
                </div>

                <div className="pt-3">
                  <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
