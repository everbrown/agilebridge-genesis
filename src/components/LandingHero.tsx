import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogoMarquee from './LogoMarquee';
import HeroFlowAnimation from './HeroFlowAnimation';

const transition = { type: "spring" as const, duration: 0.4, bounce: 0 };

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--foreground)) 0px, transparent 1px, transparent 64px),
                          repeating-linear-gradient(90deg, hsl(var(--foreground)) 0px, transparent 1px, transparent 64px)`,
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.1 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium tracking-wider uppercase border border-border rounded-sm bg-card text-muted-foreground">
            Stop re-typing. Start shipping.
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.2 }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-4 sm:mb-6 leading-[0.95]"
        >
          Still copy-pasting
          <br />
          <span className="text-primary">Gantt charts into Jira?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.3 }}
          className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed"
        >
          You inherited a 300-task .mpp file and a deadline. Now you're spending the weekend
          flattening phases into tickets, losing every parent-child relationship along the way.
          Drop the file here — we'll turn it into INVEST-ready stories in Jira, Azure DevOps, ClickUp, or wherever your team works.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-sm transition-all hover:opacity-90 active:scale-95"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#founders-note"
            className="inline-flex items-center gap-2 border border-border bg-card text-foreground font-medium px-6 py-3 rounded-sm transition-all hover:bg-muted"
          >
            Read Founder's Note
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.5 }}
        >
          <HeroFlowAnimation />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.6 }}
        >
          <LogoMarquee />
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
