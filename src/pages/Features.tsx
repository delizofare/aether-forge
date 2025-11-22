import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Zap, Shield, Layers, Database, Cpu, GitBranch } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Process complex workflows in milliseconds with our optimized orchestration engine."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with SOC2, GDPR, and HIPAA standards."
  },
  {
    icon: Layers,
    title: "Multi-Tool Integration",
    description: "Seamlessly connect with 1000+ tools and platforms in your tech stack."
  },
  {
    icon: Database,
    title: "Smart Data Handling",
    description: "Intelligent data transformation and routing across your entire workflow."
  },
  {
    icon: Cpu,
    title: "AI-Powered Decisions",
    description: "Machine learning algorithms that adapt and optimize based on your usage patterns."
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Track, rollback, and manage workflow versions with built-in version control."
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm animate-fade-in">
              <span className="text-sm text-primary font-medium">Features</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Everything you need to
              <span className="text-gradient"> orchestrate brilliantly</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Powerful features designed for teams that demand excellence in automation and workflow management.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-smooth hover:shadow-primary animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
