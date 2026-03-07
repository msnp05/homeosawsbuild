import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { ContextQuestion } from "@/lib/diagnostic-data";

interface ContextQuestionsProps {
  questions: ContextQuestion[];
  symptom?: string;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

/** Map of keyword patterns to option matches for auto-inference */
const KEYWORD_MATCHERS: Record<string, Record<string, string[]>> = {
  appliance: {
    "Washing machine": ["washer", "washing machine", "wash machine"],
    "Dryer": ["dryer", "drier"],
    "Dishwasher": ["dishwasher", "dish washer"],
    "Refrigerator": ["fridge", "refrigerator", "freezer"],
    "Oven/Range": ["oven", "range", "stove", "cooktop"],
  },
  noise: {
    "Grinding": ["grinding", "grind"],
    "Buzzing": ["buzzing", "buzz", "hum", "humming"],
    "Clicking": ["clicking", "click"],
    "Rattling": ["rattling", "rattle", "vibrat", "noisy", "noise", "loud", "sound"],
    "No sounds": [],
  },
  location: {
    "Kitchen": ["kitchen", "sink", "faucet", "garbage disposal"],
    "Bathroom": ["bathroom", "bath", "shower", "toilet"],
    "Basement": ["basement"],
    "Outdoor": ["outdoor", "outside", "yard", "garden", "hose"],
  },
  system: {
    "Central AC": ["central ac", "central air"],
    "Heat pump": ["heat pump"],
    "Furnace": ["furnace", "heater"],
    "Window unit": ["window unit", "window ac"],
    "Mini-split": ["mini-split", "mini split", "ductless"],
  },
  severity: {
    "Emergency": ["emergency", "flood", "fire", "sparking", "gas leak"],
  },
};

function inferAnswers(symptom: string, questions: ContextQuestion[]): Record<string, string> {
  const lower = symptom.toLowerCase();
  const inferred: Record<string, string> = {};

  for (const q of questions) {
    if (!q.options) continue;
    const matchers = KEYWORD_MATCHERS[q.id];
    if (!matchers) continue;

    for (const option of q.options) {
      const keywords = matchers[option];
      if (keywords && keywords.length > 0 && keywords.some((kw) => lower.includes(kw))) {
        inferred[q.id] = option;
        break;
      }
    }
  }
  return inferred;
}

const ContextQuestions = ({ questions, symptom = "", onComplete, onBack }: ContextQuestionsProps) => {
  const inferred = useMemo(() => inferAnswers(symptom, questions), [symptom, questions]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(inferred);
  const autoAdvancedRef = useRef(false);

  // Auto-advance past questions that were inferred, on mount
  useEffect(() => {
    if (autoAdvancedRef.current) return;
    autoAdvancedRef.current = true;
    // Find first question that isn't already inferred
    const firstUnanswered = questions.findIndex((q) => !inferred[q.id]);
    if (firstUnanswered > 0) {
      setCurrentIdx(firstUnanswered);
    } else if (firstUnanswered === -1 && questions.length > 0) {
      // All questions inferred — complete immediately
      onComplete(inferred);
    }
  }, []);

  const current = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isInferred = current ? !!inferred[current.id] : false;

  const handleSelect = (value: string) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      onComplete(next);
    }
  };

  const handleSkip = () => {
    const next = { ...answers, [current.id]: "skipped" };
    setAnswers(next);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      onComplete(next);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-xl"
    >
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{questions.length - currentIdx} quick question{questions.length - currentIdx > 1 ? "s" : ""}, then your diagnosis</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="glass-card rounded-xl p-6 sm:p-8"
      >
        <h3 className="font-heading text-xl sm:text-2xl text-foreground mb-3">{current.question}</h3>
        {isInferred && (
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-accent" />
            We detected <span className="font-medium text-foreground">{inferred[current.id]}</span> from your description — tap to change
          </p>
        )}

        <div className="grid gap-2.5">
          {current.options?.map((option) => {
            const isAutoSelected = inferred[current.id] === option;
            return (
              <motion.button
                key={option}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(option)}
                className={`rounded-xl border p-4 text-left text-foreground transition-all hover:border-accent hover:bg-accent/5 active:bg-accent/10 touch-manipulation min-h-[56px] text-base ${
                  isAutoSelected
                    ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                    : "border-border bg-background"
                }`}
              >
                <span className="flex items-center justify-between">
                  {option}
                  {isAutoSelected && <Check className="h-4 w-4 text-accent" />}
                </span>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation"
        >
          Skip this — I'm not sure
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ContextQuestions;
