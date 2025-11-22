import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const workflowSteps = [
  {
    step: "01",
    title: "Define Your Workflow",
    description: "Use our intuitive visual builder or write custom workflows in code. Connect multiple tools and services seamlessly."
  },
  {
    step: "02",
    title: "Set Conditions & Rules",
    description: "Add intelligent decision points, error handling, and custom logic to make your workflows adaptive and robust."
  },
  {
    step: "03",
    title: "Monitor & Optimize",
    description: "Track performance in real-time, analyze bottlenecks, and let our AI suggest optimizations automatically."
  },
  {
    step: "04",
    title: "Scale Effortlessly",
    description: "From prototype to production, handle millions of workflow executions without changing a single line of code."
  }
];

const Workflows = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm animate-fade-in">
              <span className="text-sm text-primary font-medium">Workflows</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Build workflows that
              <span className="text-gradient"> think for themselves</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Create intelligent automation that adapts to your business needs and scales with your growth.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-6 mb-20">
            {workflowSteps.map((workflow, index) => (
              <div
                key={workflow.step}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-smooth hover:shadow-primary animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="text-6xl font-bold text-primary/20 group-hover:text-primary/30 transition-smooth">
                    {workflow.step}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold">{workflow.title}</h3>
                    <p className="text-muted-foreground text-lg">{workflow.description}</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-smooth" />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using Aether to transform their workflows and boost productivity.
            </p>
            <Button variant="hero" size="lg" className="gap-2 group">
              Start building workflows
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Workflows;
