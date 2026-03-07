import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, Share2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosticResult } from "@/lib/diagnostic-data";

interface GuidedFixModeProps {
  result: DiagnosticResult;
  onExit: () => void;
  onStartOver: () => void;
}

const GuidedFixMode = ({ result, onExit, onStartOver }: GuidedFixModeProps) => {
  const diySteps = result.nextSteps.filter((s) => s.type === "diy");
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [fixWorked, setFixWorked] = useState<boolean | null>(null);

  const totalSteps = diySteps.length;
  const step = diySteps[currentStep];

  const totalMinutes = diySteps.reduce((sum, s) => sum + (s.estimatedMinutes || 0), 0);
  const estimatedSavings = Math.round(
    ((result.costEstimate.low * 4 + result.costEstimate.high * 4) / 2) -
    ((result.costEstimate.low + result.costEstimate.high) / 2)
  );

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((i) => i + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((i) => i - 1);
    }
  };

  const handleFixFeedback = (worked: boolean) => {
    setFixWorked(worked);
    console.log("[HomeOS] fix_feedback", { worked, category: result.category, symptom: result.symptom, timestamp: Date.now() });
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg px-4 py-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto mb-6 h-20 w-20 rounded-full bg-success/20 flex items-center justify-center"
        >
          <Check className="h-10 w-10 text-success" />
        </motion.div>

        <h2 className="font-heading text-3xl text-foreground mb-2">You did it!</h2>
        <p className="text-muted-foreground mb-1">
          {totalMinutes > 0 ? `Completed in ~${totalMinutes} minutes` : "Nice work!"}
        </p>
        <p className="text-lg font-medium text-success mb-8">
          Estimated savings: ~${estimatedSavings}
        </p>

        {fixWorked === null ? (
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-3">Did this fix it?</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleFixFeedback(true)}
                variant="outline"
                className="min-h-[48px] px-8 text-base touch-manipulation"
              >
                Yes!
              </Button>
              <Button
                onClick={() => handleFixFeedback(false)}
                variant="outline"
                className="min-h-[48px] px-8 text-base touch-manipulation"
              >
                Not yet
              </Button>
            </div>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-8"
          >
            {fixWorked
              ? "Awesome — glad we could help!"
              : "No worries — you might want to talk to a pro for this one."}
          </motion.p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              console.log("[HomeOS] share_win", { category: result.category, timestamp: Date.now() });
            }}
            variant="outline"
            className="min-h-[48px] gap-2 touch-manipulation"
          >
            <Share2 className="h-4 w-4" /> Share my win
          </Button>
          <Button
            onClick={onStartOver}
            className="min-h-[48px] gap-2 bg-accent text-accent-foreground hover:bg-accent/90 touch-manipulation"
          >
            <RotateCcw className="h-4 w-4" /> Start over
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg pb-28 sm:pb-0"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation"
        >
          <X className="h-4 w-4" /> Exit
        </button>
        <span className="text-sm font-medium text-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-8">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg shrink-0">
              {currentStep + 1}
            </div>
            <h3 className="font-heading text-xl sm:text-2xl text-foreground">
              {step.label}
            </h3>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            {step.description}
          </p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {step.time && <span>⏱ {step.time}</span>}
            {step.difficulty && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                {step.difficulty}
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Back link */}
      {currentStep > 0 && (
        <button
          onClick={handleBack}
          className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation mx-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Previous step
        </button>
      )}

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md p-3 sm:hidden">
        <Button
          onClick={handleNext}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 min-h-[56px] text-base rounded-xl touch-manipulation"
        >
          <Check className="h-4 w-4 mr-2" />
          {currentStep < totalSteps - 1 ? "Done — next step" : "Done — finish"}
        </Button>
      </div>

      {/* Desktop submit */}
      <div className="hidden sm:flex justify-end mt-6">
        <Button
          onClick={handleNext}
          className="bg-accent text-accent-foreground hover:bg-accent/90 min-h-[56px] px-8 text-base rounded-xl touch-manipulation"
        >
          <Check className="h-4 w-4 mr-2" />
          {currentStep < totalSteps - 1 ? "Done — next step" : "Done — finish"}
        </Button>
      </div>
    </motion.div>
  );
};

export default GuidedFixMode;
