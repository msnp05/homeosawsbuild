import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioLines, FileSearch, CheckCircle2 } from "lucide-react";

interface AnalyzingStepsProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: AudioLines,
    text: "Motor & belt ruled out from audio analysis...",
    duration: 2500,
    confidenceTarget: 82,
  },
  {
    icon: FileSearch,
    text: "Breaker confirmed fine. Isolating heating circuit...",
    duration: 2500,
    confidenceTarget: 88,
  },
  {
    icon: CheckCircle2,
    text: "Cross-referencing Samsung DV42H service manual... 91% confident. Diagnosis ready.",
    duration: 2000,
    confidenceTarget: 91,
  },
];

const AnalyzingSteps = ({ onComplete }: AnalyzingStepsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [confidence, setConfidence] = useState(71);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrentStep((s) => s + 1), STEPS[currentStep].duration);
    return () => clearTimeout(t);
  }, [currentStep, onComplete]);

  // Animate confidence to current step target
  useEffect(() => {
    if (currentStep >= STEPS.length) return;
    const target = STEPS[currentStep].confidenceTarget;
    const interval = setInterval(() => {
      setConfidence((c) => {
        if (c >= target) { clearInterval(interval); return target; }
        return c + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [currentStep]);

  const confidenceColor =
    confidence <= 50 ? "bg-danger" : confidence <= 79 ? "bg-warning" : "bg-success";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-60px)] px-6 overflow-x-hidden max-w-full"
    >
      <div className="max-w-sm w-full space-y-6">
        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">Confidence</span>
            <span className="text-xs text-foreground font-bold">{confidence}%</span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${confidenceColor} transition-colors duration-500`}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <AnimatePresence key={i}>
              {(isDone || isActive) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isDone ? 0.5 : 1, y: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="flex items-start gap-4"
                >
                  <div
                    className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                      isDone ? "bg-success/20" : "bg-accent/20"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-500 ${
                        isDone ? "text-success" : "text-accent"
                      }`}
                    />
                  </div>
                  <div className="pt-2">
                    <p className="text-foreground text-base font-medium leading-snug break-words whitespace-normal">
                      {step.text}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i < currentStep
                  ? "w-2 bg-success"
                  : i === currentStep
                  ? "w-8 bg-accent"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          This usually takes about 10 seconds
        </p>
      </div>
    </motion.div>
  );
};

export default AnalyzingSteps;
