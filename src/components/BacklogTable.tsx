import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AgileItem } from '@/lib/mpp-parser';

interface BacklogTableProps {
  items: AgileItem[];
}

const priorityColors: Record<string, string> = {
  High: 'bg-destructive/15 text-destructive',
  Medium: 'bg-warning/15 text-warning',
  Low: 'bg-muted text-muted-foreground',
};

const typeColors: Record<string, string> = {
  Epic: 'bg-primary/10 text-primary',
  'User Story': 'bg-muted text-foreground',
};

const stagger = {
  show: { transition: { staggerChildren: 0.03 } },
};

const rowVariant = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.35, bounce: 0 } },
};

const BacklogTable = ({ items }: BacklogTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="surface-elevated rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-10"></th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-16">WBS</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-24">Type</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Title</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-24">Priority</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-14">SP</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-20">Est.</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-24">Status</th>
            </tr>
          </thead>
          <motion.tbody variants={stagger} initial="hidden" animate="show">
            {items.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <motion.tr
                  key={item.id}
                  variants={rowVariant}
                  layout
                  className={`border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                    item.type === 'Epic' ? 'bg-primary/[0.03]' : ''
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <td className="px-4 py-3 align-top">
                    <span className="text-muted-foreground">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-xs text-muted-foreground align-top">
                    {item.type === 'Epic' && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold mr-1">
                        L1
                      </span>
                    )}
                    {item.outlineNumber}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-medium ${typeColors[item.type]}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring" as const, duration: 0.3, bounce: 0 }}
                          className="overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mt-3 space-y-3">
                            {/* User Story Description */}
                            <div className="p-3 rounded-sm bg-muted/50 border border-border">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                                User Story
                              </p>
                              <p className="text-xs text-foreground leading-relaxed italic">
                                {item.description}
                              </p>
                            </div>

                            {/* Acceptance Criteria */}
                            <div className="p-3 rounded-sm bg-muted/50 border border-border">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                                Acceptance Criteria
                              </p>
                              <div className="space-y-2">
                                {item.acceptanceCriteria.map((ac, idx) => (
                                  <div key={idx} className="text-xs leading-relaxed text-foreground">
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-primary/10 text-primary text-[9px] font-bold mr-1.5 align-middle">
                                      {idx + 1}
                                    </span>
                                    <span className="text-muted-foreground font-medium">Given </span>{ac.given}
                                    <span className="text-muted-foreground font-medium">, When </span>{ac.when}
                                    <span className="text-muted-foreground font-medium">, Then </span>{ac.then}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-medium ${priorityColors[item.priority]}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground font-medium align-top">{item.storyPoints}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground align-top">{item.estimate}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground align-top">{item.status}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};

export default BacklogTable;
