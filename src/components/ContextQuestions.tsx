import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Info, Sparkles } from "lucide-react";
import { ContextQuestion } from "@/lib/diagnostic-data";

interface ContextQuestionsProps {
  questions: ContextQuestion[];
  symptom?: string;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

/** Map of keyword patterns to option matches for auto-inference */
const KEYWORD_MATCHERS: Record<string, Record<string, string[]>> = {
  brand: {
    Samsung: ["samsung"],
    LG: ["lg"],
    Whirlpool: ["whirlpool"],
  },
  spinning: {
    "Yes, it spins but no heat": ["spinning", "spins", "cold", "wet", "no heat", "won't heat", "not heating"],
    "No, it's completely dead": ["dead", "won't turn on", "no power"],
    "It makes a weird grinding noise": ["grinding", "grind", "noise"],
  },
  fuel_type: {
    "Gas (I see a gas line)": ["gas dryer", "gas line"],
  },
  appliance: {
    "Washing machine": ["washer", "washing machine", "wash machine"],
    Dryer: ["dryer", "drier"],
    Dishwasher: ["dishwasher", "dish washer"],
    Refrigerator: ["fridge", "refrigerator", "freezer"],
    "Oven/Range": ["oven", "range", "stove", "cooktop"],
  },
  noise: {
    Grinding: ["grinding", "grind"],
    Buzzing: ["buzzing", "buzz", "hum", "humming"],
    Clicking: ["clicking", "click"],
    Rattling: ["rattling", "rattle", "vibrat", "noisy", "noise", "loud", "sound"],
    "No sounds": [],
  },
};

const isVisible = (q: ContextQuestion, currentAnswers: Record<string, string>) =>
  !q.condition || currentAnswers[q.condition.id] === q.condition.value;

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

/** Find next visible question index starting from fromIdx */
function findNextVisible(questions: ContextQuestion[], fromIdx: number, answers: Record<string, string>): number {
  for (let i = fromIdx; i < questions.length; i++) {
    if (isVisible(questions[i], answers)) return i;
  }
  return -1;
}

const ContextQuestions = ({ questions, symptom = "", onComplete, onBack }: ContextQuestionsProps) => {
  const inferred = useMemo(() => inferAnswers(symptom, questions), [symptom, questions]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(inferred);
  const autoAdvancedRef = useRef(false);

  // Auto-advance past inferred questions on mount
  useEffect(() => {
    if (autoAdvancedRef.current) return;
    autoAdvancedRef.current = true;
    const firstUnanswered = findNextVisible(
      questions,
      0,
      inferred
    );
    // Within visible questions, find first one without an inferred answer
    if (firstUnanswered >= 0) {
      const first = questions.findIndex((q, i) => i >= firstUnanswered && isVisible(q, inferred) && !inferred[q.id]);
      if (first > 0) {
        setCurrentIdx(first);
      } else if (first === -1 && questions.length > 0) {
        onComplete(inferred);
      }
    }
  }, []);

  const current = questions[currentIdx];
  const visibleQuestions = questions.filter((q) => isVisible(q, answers));
  const visibleIdx = current ? visibleQuestions.findIndex((q) => q.id === current.id) : 0;
  const progress = visibleQuestions.length > 0 ? ((visibleIdx + 1) / visibleQuestions.length) * 100 : 0;
  const isInferred = current ? !!inferred[current.id] : false;
  const remaining = visibleQuestions.length - visibleIdx;

  const advanceOrComplete = (nextAnswers: Record<string, string>) => {
    const nextIdx = findNextVisible(questions, currentIdx + 1, nextAnswers);
    if (nextIdx >= 0) {
      setCurrentIdx(nextIdx);
    } else {
      onComplete(nextAnswers);
    }
  };

  const handleSelect = (value: string) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    advanceOrComplete(next);
  };

  const handleSkip = () => {
    const next = { ...answers, [current.id]: "skipped" };
    setAnswers(next);
    advanceOrComplete(next);
  };

  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-60px)] px-4 pt-8 pb-24 overflow-x-hidden max-w-full"
    >
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Warm header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-heading text-2xl sm:text-3xl text-foreground leading-tight mb-2">
            Got it. Let's narrow this down.
          </h2>
          <p className="text-muted-foreground text-base">
            {remaining} quick question{remaining > 1 ? "s" : ""}, then your diagnosis.
          </p>
        </motion.div>

        {/* Inferred answers pill */}
        {Object.keys(inferred).length > 0 && (
          <div className="inline-flex items-center gap-1.5 mb-4 bg-accent/10 rounded-full px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-accent">
              ✨ {Object.keys(inferred).length} answers pre-filled from your description
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>
              Question {visibleIdx + 1} of {visibleQuestions.length}
            </span>
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

        {/* Question card */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25, type: "spring", stiffness: 400, damping: 30 }}
          className="glass-card rounded-2xl p-6 sm:p-8"
        >
          <h3 className="font-heading text-xl sm:text-2xl text-foreground mb-2">
            {current.question}
          </h3>

          {/* Helper text (e.g. breaker tip) */}
          {current.helperText && (
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 mb-4">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground break-words whitespace-normal">{current.helperText}</p>
              </div>
            </div>
          )}

          {isInferred && (
            <p className="text-sm text-muted-foreground mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <Check className="h-3.5 w-3.5 text-accent flex-shrink-0" />
              <span>
                We detected{" "}
                <span className="font-medium text-foreground">{inferred[current.id]}</span> — tap to
                change
              </span>
            </p>
          )}

          <div className="grid gap-3 mt-4">
            {current.options?.map((option) => {
              const isAutoSelected = inferred[current.id] === option;
              return (
                <motion.button
                  key={option}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(option)}
                  className={`rounded-2xl border p-4 text-left text-foreground transition-all hover:border-accent hover:bg-accent/5 active:bg-accent/10 touch-manipulation min-h-[56px] text-base font-medium ${
                    isAutoSelected
                      ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                      : "border-border bg-card/50 backdrop-blur-sm"
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
            className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation"
          >
            Skip this — I'm not sure
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContextQuestions;
