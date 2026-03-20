import { motion } from 'framer-motion';

const FoundersNote = () => {
  return (
    <section id="founders-note" className="py-24 px-8 bg-background border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", duration: 0.6, bounce: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="surface-elevated rounded-sm p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">AB</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Founder's Note</p>
              <p className="text-xs text-muted-foreground">From the team at AgileBridge.ai</p>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              I've sat in the meeting where someone drops a 400-line Microsoft Project file
              on a dev team and says "put this in Jira by Monday." I've been the one doing it —
              manually, row by row, losing the hierarchy with every paste.
            </p>
            <p>
              The worst part isn't the tedium. It's watching carefully nested phases, deliverables,
              and dependencies collapse into a flat list of context-free tickets. By the time
              you're done, the plan doesn't mean what it used to mean.
            </p>
            <p>
              We built AgileBridge because that weekend shouldn't exist.
              Upload the file, keep the structure, and get Epics and User Stories
              that actually reflect what was planned — not a guessed-at backlog.
            </p>
            <p className="text-foreground font-medium pt-2">
              If you've ever dreaded opening an .mpp file on a Friday afternoon,
              this is for you.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                MW
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Michael Wray</p>
                <p className="text-xs text-muted-foreground">CEO & Co-founder</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default FoundersNote;
