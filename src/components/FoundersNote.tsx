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
              We built AgileBridge because we spent too many weekends manually transcribing
              Gantt charts into Jira. It wasn't just tedious; it was a loss of structural intent.
            </p>
            <p>
              Every time a project manager exported a Microsoft Project file and handed it to a
              dev team, the hierarchy — the careful nesting of phases, deliverables, and tasks — was
              flattened into a list of tickets with no context.
            </p>
            <p>
              We've automated the translation, so you can focus on the build.
              AgileBridge preserves the Work Breakdown Structure of your legacy plans and maps them
              directly to Epics and User Stories, maintaining the relationships that matter.
            </p>
            <p className="text-foreground font-medium pt-2">
              The bridge between legacy planning and agile execution is built on structural integrity,
              not generative fluff.
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
