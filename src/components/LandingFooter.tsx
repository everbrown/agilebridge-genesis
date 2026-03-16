const LandingFooter = () => (
  <footer className="py-12 px-8 border-t border-border bg-background">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} AgileBridge.ai — All rights reserved.</p>
      <div className="flex items-center gap-6">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Contact</span>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
