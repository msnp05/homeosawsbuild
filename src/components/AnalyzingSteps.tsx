import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ListChecks, Lightbulb, Check } from "lucide-react";

interface AnalyzingStepsProps {
  onComplete?: () => void;
}

const STEPS = [
  { label: "Reading what you shared…", icon: Search },
  { label: "Checking similar issues…", icon: ListChecks },
  { label: "Putting your options together…", icon: Lightbulb },
];

const AnalyzingSteps = ({ onComplete }: AnalyzingStepsProps) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(1), 3000);
    const t2 = setTimeout(() => setActiveStep(2), 7000);
    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      <div className="space-y-4 w-full max-w-xs">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isDone || isActive ? 1 : 0.4, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                isDone ? "bg-success text-success-foreground" : isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Icon className={`h-4 w-4 ${isActive ? "animate-pulse-soft" : ""}`} />
                )}
              </div>
              <span className={`text-sm transition-colors duration-300 ${
                isActive ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-8">This usually takes about 10 seconds</p>
    </motion.div>
  );
};

export default AnalyzingSteps;
