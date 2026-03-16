import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

const ProgressBar = ({ progress, label }: ProgressBarProps) => (
  <div className="surface-elevated rounded-sm p-6">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-foreground">{label || 'Processing'}</p>
      <span className="text-sm tabular-nums text-muted-foreground">{progress}%</span>
    </div>
    <div className="h-1.5 bg-muted rounded-sm overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", duration: 0.6, bounce: 0 }}
        className="h-full bg-primary rounded-sm"
      />
    </div>
  </div>
);

export default ProgressBar;
