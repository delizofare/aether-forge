const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-primary-foreground rounded-sm"></div>
            </div>
            <span className="text-sm text-muted-foreground">
              © 2024 Aether. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-smooth">Privacy</a>
            <a href="#" className="hover:text-foreground transition-smooth">Terms</a>
            <a href="#" className="hover:text-foreground transition-smooth">Documentation</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
