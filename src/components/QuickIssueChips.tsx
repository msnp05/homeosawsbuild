import { motion } from "framer-motion";
import { QUICK_ISSUES, QuickIssue } from "@/lib/diagnostic-data";

interface QuickIssueChipsProps {
  onSelect: (issue: QuickIssue) => void;
}

const QuickIssueChips = ({ onSelect }: QuickIssueChipsProps) => {
  return (
    <div className="chips-row">
      {QUICK_ISSUES.map((issue, i) => (
        <motion.button
          key={issue.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          onClick={() => onSelect(issue)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground whitespace-nowrap transition-all hover:border-accent hover:bg-accent/5 active:scale-95 touch-manipulation min-h-[44px]"
        >
          {issue.label}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickIssueChips;
