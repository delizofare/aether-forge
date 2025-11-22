import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Cloud, Code, Database, Mail, MessageSquare, Calendar, FileText, GitBranch } from "lucide-react";

const integrationCategories = [
  {
    category: "Communication",
    icon: MessageSquare,
    tools: ["Slack", "Discord", "Microsoft Teams", "Telegram", "WhatsApp"]
  },
  {
    category: "Development",
    icon: Code,
    tools: ["GitHub", "GitLab", "Bitbucket", "Jira", "Linear"]
  },
  {
    category: "Database",
    icon: Database,
    tools: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase"]
  },
  {
    category: "Email",
    icon: Mail,
    tools: ["Gmail", "Outlook", "SendGrid", "Mailchimp", "Postmark"]
  },
  {
    category: "Cloud Services",
    icon: Cloud,
    tools: ["AWS", "Google Cloud", "Azure", "Vercel", "Netlify"]
  },
  {
    category: "Productivity",
    icon: Calendar,
    tools: ["Notion", "Google Calendar", "Asana", "Trello", "Monday.com"]
  },
  {
    category: "Documentation",
    icon: FileText,
    tools: ["Confluence", "Notion", "Gitbook", "ReadMe", "Docusaurus"]
  },
  {
    category: "Version Control",
    icon: GitBranch,
    tools: ["GitHub", "GitLab", "Bitbucket", "Azure DevOps", "Perforce"]
  }
];

const Integrations = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm animate-fade-in">
              <span className="text-sm text-primary font-medium">Integrations</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Connect with
              <span className="text-gradient"> everything you use</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Seamlessly integrate with 1000+ tools and platforms. If we don't have it, build it with our API.
            </p>
          </div>

          {/* Integration Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrationCategories.map((category, index) => (
              <div
                key={category.category}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-smooth hover:shadow-primary animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.tools.map((tool) => (
                    <div
                      key={tool}
                      className="text-sm text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Integration Section */}
          <div className="mt-20 p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <h2 className="text-3xl font-bold mb-4">Need a custom integration?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our powerful API and webhook system lets you build custom integrations with any service. Or let our team build it for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:shadow-primary transition-smooth">
                View API Documentation
              </button>
              <button className="px-6 py-3 rounded-xl border border-border hover:border-primary/50 transition-smooth">
                Request Integration
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Integrations;
