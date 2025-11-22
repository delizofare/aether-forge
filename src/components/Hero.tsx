import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-glow-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: "1.5s" }}></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm animate-fade-in">
            <div className="w-2 h-2 bg-primary rounded-full animate-glow-pulse shadow-glow"></div>
            <span className="text-sm text-foreground font-medium">Live Orchestration Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Aether — The{" "}
            <span className="relative inline-block">
              <span className="text-gradient">Autonomous</span>
              <div className="absolute -right-8 top-0 w-16 h-16 bg-primary/30 rounded-full blur-xl animate-glow-pulse"></div>
            </span>
            <br />
            Orchestrated Worker
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            An intelligent, reliable, and calm digital employee that plans, executes, and adapts multi-step workflows across your tools. Built for high-trust operations in modern teams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Button variant="hero" size="lg" className="gap-2 group" asChild>
              <Link to="/agent">
                Start orchestration
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Explore capabilities
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <div className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span>Private by design</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span>Enterprise-ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span>Observe, decide, act</span>
            </div>
          </div>
        </div>

        {/* Visual Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-gradient-to-tl from-primary/20 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
