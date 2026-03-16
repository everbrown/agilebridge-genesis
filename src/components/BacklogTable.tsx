import { motion } from 'framer-motion';
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
  if (items.length === 0) return null;

  return (
    <div className="surface-elevated rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-16">WBS</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-24">Type</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Title</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-24">Priority</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-20">Est.</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-24">Status</th>
            </tr>
          </thead>
          <motion.tbody variants={stagger} initial="hidden" animate="show">
            {items.map((item) => (
              <motion.tr
                key={item.id}
                variants={rowVariant}
                className={`h-12 border-b border-border hover:bg-muted/50 transition-colors ${
                  item.type === 'Epic' ? 'bg-primary/[0.03]' : ''
                }`}
              >
                <td className="px-4 tabular-nums text-xs text-muted-foreground">
                  {item.type === 'Epic' && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold mr-1">
                      L1
                    </span>
                  )}
                  {item.outlineNumber}
                </td>
                <td className="px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-medium ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 font-medium text-foreground">{item.title}</td>
                <td className="px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-medium ${priorityColors[item.priority]}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-4 tabular-nums text-muted-foreground">{item.estimate}</td>
                <td className="px-4 text-xs text-muted-foreground">{item.status}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};

export default BacklogTable;
