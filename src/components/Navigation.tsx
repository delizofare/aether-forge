import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Features", path: "/features" },
    { name: "Workflows", path: "/workflows" },
    { name: "Integrations", path: "/integrations" },
    { name: "Resources", path: "/resources" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-smooth group-hover:shadow-glow">
              <div className="w-4 h-4 border-2 border-primary-foreground rounded-sm"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-foreground">Aether</span>
              <span className="text-[10px] text-muted-foreground">Autonomous Orchestrated Worker</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-smooth">
              <Search className="w-5 h-5" />
            </button>
            <Button variant="hero" size="sm">
              Get started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {link.name}
                </Link>
              ))}
              <Button variant="hero" size="sm" className="w-full">
                Get started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
