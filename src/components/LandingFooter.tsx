import { Link } from 'react-router-dom';

const LandingFooter = () => (
  <footer className="py-12 px-8 border-t border-border bg-background">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} AgileBridge.ai — All rights reserved.</p>
      <div className="flex items-center gap-6">
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        <a href="mailto:support@agilebridge.ai" className="hover:text-foreground transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
