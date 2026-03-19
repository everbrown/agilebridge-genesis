import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react';

const STEP_DURATION = 10000; // 10s per step, 30s total loop

const spring = { type: 'spring' as const, duration: 0.5, bounce: 0.1 };

// ── Step 1: Messy .mpp file ─────────────────────────────────────────
const MessyFile = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="relative w-[280px]">
      {/* Messy file card */}
      <motion.div
        initial={{ rotate: -2, opacity: 0, y: 12 }}
        animate={{ rotate: -2, opacity: 0.5, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
        className="absolute inset-0 bg-muted border border-border rounded-sm p-3 -translate-y-1 translate-x-1"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.2 }}
        className="relative bg-card border border-border rounded-sm p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="w-4 h-4 text-destructive" />
          <span className="text-xs font-semibold text-foreground tracking-tight">legacy_plan_v3_FINAL.mpp</span>
        </div>
        {/* Messy rows */}
        <div className="space-y-1.5">
          {[
            { w: 'w-full', color: 'bg-destructive/20' },
            { w: 'w-[85%]', color: 'bg-muted-foreground/15' },
            { w: 'w-[92%]', color: 'bg-destructive/15' },
            { w: 'w-[60%]', color: 'bg-muted-foreground/10' },
            { w: 'w-[78%]', color: 'bg-destructive/20' },
            { w: 'w-[45%]', color: 'bg-muted-foreground/15' },
          ].map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.3 + i * 0.06 }}
              className={`h-2 rounded-sm ${row.w} ${row.color}`}
            />
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[9px] text-destructive mt-2 font-medium"
        >
          ⚠ 247 tasks · No user stories · Outdated dependencies
        </motion.p>
      </motion.div>
    </div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="text-xs font-medium text-muted-foreground"
    >
      Legacy file uploaded
    </motion.p>
  </div>
);

// ── Step 2: Clean user story ────────────────────────────────────────
const CleanStory = () => (
  <div className="flex flex-col items-center gap-3">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay: 0.15 }}
      className="w-[320px] bg-card border border-primary/30 rounded-sm p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-primary/10 text-primary text-[9px] font-bold">US</span>
        <span className="text-xs font-semibold text-foreground">Implement SSO Integration</span>
        <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">5 SP</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.4 }}
        className="bg-muted/50 border border-border rounded-sm p-2.5 mb-2.5"
      >
        <p className="text-[10px] text-muted-foreground font-medium mb-1">User Story</p>
        <p className="text-[11px] text-foreground leading-relaxed italic">
          As an <span className="text-primary font-medium">Enterprise User</span>, I want to implement SSO integration, so that users can securely access the system with minimal friction.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.6 }}
        className="bg-muted/50 border border-border rounded-sm p-2.5"
      >
        <p className="text-[10px] text-muted-foreground font-medium mb-1">Acceptance Criteria</p>
        <div className="space-y-1">
          {[
            { g: 'valid SSO credentials', w: 'login attempt', t: 'authenticated in < 3s' },
            { g: 'session expires', w: 'user acts', t: 'redirect to login' },
          ].map((ac, i) => (
            <p key={i} className="text-[10px] text-foreground leading-snug">
              <span className="text-primary font-medium">Given</span> {ac.g} <span className="text-primary font-medium">When</span> {ac.w} <span className="text-primary font-medium">Then</span> {ac.t}
            </p>
          ))}
        </div>
      </motion.div>
    </motion.div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-xs font-medium text-muted-foreground"
    >
      INVEST-compliant story generated
    </motion.p>
  </div>
);

// ── Step 3: Jira board populated ────────────────────────────────────
const JiraBoard = () => {
  const columns = [
    {
      title: 'To Do',
      color: 'bg-muted',
      cards: [
        { label: 'Build RBAC', sp: 8 },
        { label: 'API versioning', sp: 3 },
      ],
    },
    {
      title: 'In Progress',
      color: 'bg-primary/10',
      cards: [
        { label: 'SSO Integration', sp: 5 },
        { label: 'CI/CD Pipelines', sp: 8 },
      ],
    },
    {
      title: 'Done',
      color: 'bg-accent/10',
      cards: [
        { label: 'Infra Audit', sp: 3, done: true },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.15 }}
        className="w-[340px] bg-card border border-border rounded-sm p-3 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Board View</span>
          <span className="ml-auto text-[9px] text-accent font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Import complete
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {columns.map((col, ci) => (
            <motion.div
              key={ci}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.3 + ci * 0.15 }}
              className={`${col.color} rounded-sm p-1.5`}
            >
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                {col.title}
              </p>
              <div className="space-y-1">
                {col.cards.map((card, cdi) => (
                  <motion.div
                    key={cdi}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.5 + ci * 0.15 + cdi * 0.1 }}
                    className={`bg-card border border-border rounded-sm p-1.5 ${card.done ? 'opacity-60' : ''}`}
                  >
                    <p className={`text-[9px] font-medium text-foreground leading-tight ${card.done ? 'line-through' : ''}`}>
                      {card.label}
                    </p>
                    <p className="text-[8px] text-primary font-bold mt-0.5">{card.sp} SP</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs font-medium text-muted-foreground"
      >
        Board populated instantly
      </motion.p>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────
const steps = [
  { key: 'messy', component: MessyFile },
  { key: 'story', component: CleanStory },
  { key: 'board', component: JiraBoard },
];

const HeroFlowAnimation = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  const StepComponent = steps[activeStep].component;

  return (
    <div className="w-full max-w-xl mx-auto mt-12">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['Upload .mpp', 'Generate Stories', 'Populate Board'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium transition-all duration-300 ${
                i === activeStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">
                {i + 1}
              </span>
              {label}
            </button>
            {i < 2 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6 px-8">
        {steps.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width: i < activeStep ? '100%' : i === activeStep ? '100%' : '0%',
              }}
              transition={
                i === activeStep
                  ? { duration: STEP_DURATION / 1000, ease: 'linear' }
                  : { duration: 0.3 }
              }
              key={`${i}-${activeStep}`}
            />
          </div>
        ))}
      </div>

      {/* Animated content */}
      <div className="flex items-center justify-center min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[activeStep].key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroFlowAnimation;
