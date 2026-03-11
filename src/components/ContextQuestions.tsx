import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Info, PencilLine } from "lucide-react";
import { ContextQuestion } from "@/lib/diagnostic-data";

interface ContextQuestionsProps {
  questions: ContextQuestion[];
  symptom?: string;
  prefilled?: Record<string, string>;
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
  const [answers, setAnswers] = useState<Record<string, string>>(inferred);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const initialRevealed = new Set<string>();
    if (questions.length > 0) initialRevealed.add(questions[0].id);

    for (const q of questions) {
      if (inferred[q.id] !== undefined && isVisible(q, inferred)) {
        initialRevealed.add(q.id);
      }
    }

    let firstActive = -1;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (isVisible(q, inferred) && inferred[q.id] === undefined) {
        for (let j = 0; j <= i; j++) {
          if (isVisible(questions[j], inferred)) initialRevealed.add(questions[j].id);
        }
        firstActive = i;
        break;
      }
    }

    setRevealedIds(initialRevealed);
    if (firstActive === -1 && Object.keys(inferred).length > 0) {
      onComplete(inferred);
    } else if (firstActive === -1) {
      setActiveIdx(0);
    } else {
      setActiveIdx(firstActive);
    }
  }, []);

  const scrollToQuestion = (id: string) => {
    setTimeout(() => {
      questionRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 120);
  };

  const handleSelect = (questionId: string, questionIdx: number, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };

    for (const q of questions) {
      if (q.condition && q.condition.id === questionId) {
        if (newAnswers[q.condition.id] !== q.condition.value) {
          delete newAnswers[q.id];
        }
      }
    }

    setAnswers(newAnswers);

    const nextIdx = findNextVisible(questions, questionIdx + 1, newAnswers);
    if (nextIdx === -1) {
      setActiveIdx(-1);
      onComplete(newAnswers);
      return;
    }

    const nextQuestion = questions[nextIdx];
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.add(nextQuestion.id);
      return next;
    });
    setActiveIdx(nextIdx);
    scrollToQuestion(nextQuestion.id);
  };

  const handleEdit = (questionIdx: number) => {
    setActiveIdx(questionIdx);
    scrollToQuestion(questions[questionIdx].id);
  };

  const visibleRevealed = questions.filter(
    (q) => revealedIds.has(q.id) && isVisible(q, answers)
  );
  const totalVisible = questions.filter((q) => isVisible(q, answers)).length;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== "skipped"
  ).length;
  const progress = totalVisible > 0 ? (answeredCount / totalVisible) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-60px)] px-4 pt-8 pb-32 overflow-x-hidden max-w-full"
    >
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-heading text-2xl sm:text-3xl text-foreground leading-tight mb-2">
            Got it. Let's narrow this down.
          </h2>
          <p className="text-muted-foreground text-sm">
            Answer below — tap any answer to change it.
          </p>
        </div>

        {/* Sticky progress bar */}
        <div className="sticky top-[60px] z-20 bg-background/80 backdrop-blur-sm pb-4 mb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{answeredCount} of {totalVisible} answered</span>
            {Object.keys(inferred).length > 0 && (
              <span className="text-accent font-medium">
                ✦ {Object.keys(inferred).length} auto-filled
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleRevealed.map((q, i) => {
              const qIdx = questions.findIndex((x) => x.id === q.id);
              const isActive = activeIdx === qIdx;
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "skipped";
              const isAutoInferred = inferred[q.id] !== undefined;

              return (
                <motion.div
                  key={q.id}
                  ref={(el) => { questionRefs.current[q.id] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 350, damping: 30 }}
                >
                  {isActive ? (
                    /* ── EXPANDED (active) QUESTION CARD ── */
                    <div className="glass-card rounded-2xl p-5 border-2 border-accent/40">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <h3 className="font-heading text-base sm:text-lg text-foreground leading-snug">
                          {q.question}
                        </h3>
                      </div>

                      {q.helperText && (
                        <div className="rounded-xl bg-warning/10 border border-warning/20 p-3 mb-3">
                          <div className="flex gap-2">
                            <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground break-words whitespace-normal">
                              {q.helperText}
                            </p>
                          </div>
                        </div>
                      )}

                      {isAutoInferred && (
                        <p className="text-xs text-accent mb-3 flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          Auto-detected from your description — confirm or change below
                        </p>
                      )}

                      <div className="grid gap-2 mt-1">
                        {q.options?.map((option) => {
                          const isCurrentAnswer = answers[q.id] === option;
                          return (
                            <motion.button
                              key={option}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleSelect(q.id, qIdx, option)}
                              className={`rounded-xl border-2 p-3.5 text-left text-foreground transition-all touch-manipulation min-h-[52px] text-sm font-medium ${
                                isCurrentAnswer
                                  ? "border-accent bg-accent/10"
                                  : "border-border bg-card/50"
                              }`}
                            >
                              <span className="flex items-center justify-between">
                                {option}
                                {isCurrentAnswer && (
                                  <Check className="h-4 w-4 text-accent flex-shrink-0 ml-2" />
                                )}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handleSelect(q.id, qIdx, "skipped")}
                        className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[40px] touch-manipulation"
                      >
                        Not sure — skip this
                      </button>
                    </div>
                  ) : isAnswered ? (
                    /* ── COLLAPSED ANSWERED ROW ── */
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleEdit(qIdx)}
                      className="w-full rounded-2xl bg-card border border-border/60 px-4 py-3 flex items-center gap-3 text-left touch-manipulation hover:border-accent/40 transition-colors"
                    >
                      <div className="h-6 w-6 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                        {isAutoInferred ? (
                          <span className="text-[9px] font-bold text-accent">AI</span>
                        ) : (
                          <Check className="h-3.5 w-3.5 text-success" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{q.question}</p>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {answers[q.id]}
                        </p>
                      </div>
                      <PencilLine className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                    </motion.button>
                  ) : null}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ContextQuestions;
