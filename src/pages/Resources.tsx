import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookOpen, Video, Code, MessageCircle, FileText, Lightbulb } from "lucide-react";

const resources = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Comprehensive guides and API references to get you started quickly.",
    link: "#"
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Step-by-step video courses from beginner to advanced topics.",
    link: "#"
  },
  {
    icon: Code,
    title: "Code Examples",
    description: "Ready-to-use templates and workflow examples for common use cases.",
    link: "#"
  },
  {
    icon: MessageCircle,
    title: "Community Forum",
    description: "Join discussions, ask questions, and share knowledge with other users.",
    link: "#"
  },
  {
    icon: FileText,
    title: "Blog & Articles",
    description: "Latest insights, best practices, and product updates from our team.",
    link: "#"
  },
  {
    icon: Lightbulb,
    title: "Best Practices",
    description: "Learn optimization techniques and workflow design patterns.",
    link: "#"
  }
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm animate-fade-in">
              <span className="text-sm text-primary font-medium">Resources</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Everything you need to
              <span className="text-gradient"> succeed with Aether</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Explore our comprehensive library of guides, tutorials, and resources to master workflow orchestration.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {resources.map((resource, index) => (
              <a
                key={resource.title}
                href={resource.link}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-smooth hover:shadow-primary animate-fade-in-up block"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth">
                  <resource.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-smooth">{resource.title}</h3>
                <p className="text-muted-foreground">{resource.description}</p>
              </a>
            ))}
          </div>

          {/* Support Section */}
          <div className="p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Need help?</h2>
              <p className="text-muted-foreground mb-8">
                Our support team is available 24/7 to help you with any questions or issues you might have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:shadow-primary transition-smooth">
                  Contact Support
                </button>
                <button className="px-6 py-3 rounded-xl border border-border hover:border-primary/50 transition-smooth">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
