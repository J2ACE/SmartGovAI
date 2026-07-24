import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

const keyPoints = [
  { icon: MapPin, text: 'Auto-location detection via GPS' },
  { icon: Users, text: 'Division-based smart routing' },
  { icon: Clock, text: 'Real-time contractor management' },
  { icon: BarChart3, text: 'ML-powered analytics & predictions' },
];

export function HeroSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-primary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div ref={ref} className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div
            className={cn(
              'space-y-8 opacity-0',
              isVisible && 'animate-fade-in-up'
            )}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Smart City Initiative
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Simplifying{' '}
              <span className="gradient-text">Civic Issue</span>{' '}
              Management for Smart Cities
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              A unified platform for citizens to report civic issues and for
              administrators to manage, track, and resolve them efficiently with
              AI-powered insights.
            </p>

            <ul className="space-y-3">
              {keyPoints.map((point, index) => (
                <li
                  key={index}
                  className={cn(
                    'flex items-center gap-3 text-foreground opacity-0',
                    isVisible && 'animate-fade-in-up',
                    `animation-delay-${(index + 2) * 100}`
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/city-selection">
                  Authorized Personnel Login
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="xl">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>

          {/* Right Content - Mockup Card */}
          <div
            className={cn(
              'relative opacity-0',
              isVisible && 'animate-slide-in-right animation-delay-300'
            )}
          >
            <div className="relative">
              {/* Main Card */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Sample Complaint #CF-2024-001
                  </span>
                  <span className="status-badge status-in-progress">
                    In Progress
                  </span>
                </div>

                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-primary/40" />
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">
                    Pothole on Main Street
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    North Division • Ward 12
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>45 upvotes</span>
                  </div>
                  <div className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">94%</p>
                    <p className="text-xs text-muted-foreground">
                      Resolution Rate
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 glass-card p-4 rounded-xl animate-float animation-delay-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">1.2K</p>
                    <p className="text-xs text-muted-foreground">
                      Issues Resolved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
