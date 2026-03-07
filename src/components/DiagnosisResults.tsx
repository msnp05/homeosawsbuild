import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldX, Wrench, Eye, Phone, ThumbsUp, ThumbsDown, Video, ChevronDown, Clock, ArrowLeft, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DiagnosticResult } from "@/lib/diagnostic-data";
import StickyProCTA from "@/components/StickyProCTA";

interface DiagnosisResultsProps {
  result: DiagnosticResult;
  onStartOver: () => void;
  onConsult: () => void;
  onGuidedFix: () => void;
}

const stepIcons = { diy: Wrench, monitor: Eye, professional: Phone };

const confidenceLabel = (score: number) => {
  if (score >= 75) return { text: "We're pretty sure", dot: "bg-success" };
  if (score >= 50) return { text: "Our best guess", dot: "bg-warning" };
  return { text: "We're not sure — a pro would help", dot: "bg-danger" };
};

const DiagnosisResults = ({ result, onStartOver, onConsult, onGuidedFix }: DiagnosisResultsProps) => {
  const [showCauses, setShowCauses] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [feedbackState, setFeedbackState] = useState<"none" | "up" | "down">("none");
  const [feedbackText, setFeedbackText] = useState("");

  const conf = confidenceLabel(result.confidenceScore);
  const needsPro = result.confidenceScore < 75 || result.safetyLevel !== "safe";
  const showMicroConsult = false; // feature flag
  const showProCTA = showMicroConsult && needsPro;

  const diySteps = result.nextSteps.filter((s) => s.type === "diy");
  const visibleDiySteps = showAllSteps ? diySteps : diySteps.slice(0, 3);

  const handleFeedbackUp = () => {
    setFeedbackState("up");
    console.log("[HomeOS] feedback_positive", { category: result.category, timestamp: Date.now() });
  };

  const handleFeedbackDown = () => {
    setFeedbackState("down");
    console.log("[HomeOS] feedback_negative", { category: result.category, timestamp: Date.now() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-auto max-w-2xl space-y-4 ${showProCTA ? "pb-20 sm:pb-0" : ""}`}
    >
      <button onClick={onStartOver} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation">
        <ArrowLeft className="h-4 w-4" /> Start over
      </button>

      {/* A. Relief beat / Safety banner */}
      {result.safetyLevel === "safe" && result.confidenceScore >= 75 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 flex items-center gap-2"
        >
          <Shield className="h-4 w-4 text-success shrink-0" />
          <p className="text-sm font-medium text-success">Good news — this looks fixable.</p>
        </motion.div>
      )}

      {result.safetyLevel === "caution" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border-l-4 border-warning bg-warning/10 p-4 flex gap-3"
        >
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-warning" />
          <div>
            <p className="font-medium text-foreground">⚠️ Heads up — this one needs a licensed pro</p>
            <p className="text-sm mt-0.5 text-muted-foreground">Here's what we know, but don't attempt this repair yourself.</p>
          </div>
        </motion.div>
      )}

      {result.safetyLevel === "danger" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border-2 border-danger p-4 flex gap-3 bg-danger/10"
        >
          <ShieldX className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="font-medium text-danger">This is an emergency situation. Please contact a professional immediately.</p>
        </motion.div>
      )}

      {/* B. Verdict card — whole card tappable */}
      <button
        onClick={() => setShowConfidence(!showConfidence)}
        className="w-full text-left glass-card rounded-xl p-5 sm:p-6 touch-manipulation"
      >
        <p className="text-sm text-muted-foreground mb-1">Most likely:</p>
        <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-3">
          {result.causes[0]?.name}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${conf.dot}`} />
          <AnimatePresence mode="wait">
            {showConfidence ? (
              <motion.span
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                {conf.text} ({result.confidenceScore}%)
              </motion.span>
            ) : (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground"
              >
                Tap for details
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </button>

      {/* C. What to do now */}
      <div className="glass-card rounded-xl p-5 sm:p-6">
        <h3 className="font-heading text-xl text-foreground mb-4">What to do now</h3>

        {/* Safe + high confidence: DIY primary */}
        {!needsPro && (
          <>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Try this yourself</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {diySteps[0]?.time && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> ~{diySteps.reduce((s, st) => s + (st.estimatedMinutes || 0), 0) || '?'} min total
                      </span>
                    )}
                    {diySteps[0]?.difficulty && (
                      <span className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                        {diySteps[0].difficultyLevel === "beginner" ? "Beginner" : "Intermediate"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Steps list */}
              <div className="space-y-2 mb-3">
                {visibleDiySteps.map((step, i) => (
                  <div key={step.label} className="flex gap-3 items-start">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground">{step.label}</p>
                  </div>
                ))}
              </div>

              {diySteps.length > 3 && !showAllSteps && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAllSteps(true); }}
                  className="text-sm text-accent hover:underline mb-3 touch-manipulation min-h-[44px]"
                >
                  See all {diySteps.length} steps
                </button>
              )}

              {/* Cost + social proof */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
                <span>Parts: ~${result.costEstimate.low}–${result.costEstimate.high}</span>
                {result.socialProof && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    ~{result.socialProof.count} homeowners fixed this — avg {result.socialProof.avgMinutes} min
                  </span>
                )}
              </div>

              <Button
                onClick={onGuidedFix}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 min-h-[56px] text-base rounded-xl touch-manipulation"
              >
                I'll try this →
              </Button>
            </div>

            {/* Secondary pro link */}
            <button
              onClick={onConsult}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" /> Not confident? Talk to a pro
            </button>
          </>
        )}

        {/* Caution or low confidence: Pro primary */}
        {needsPro && (
          <>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Talk to a local pro</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Get an expert answer in minutes — no house call needed.</p>
                </div>
              </div>
              <Button
                onClick={onConsult}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 min-h-[56px] text-base rounded-xl touch-manipulation"
              >
                Talk to a pro →
              </Button>
            </div>

            {/* Secondary DIY link */}
            {diySteps.length > 0 && (
              <button
                onClick={onGuidedFix}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
              >
                <Wrench className="h-4 w-4" /> I want to try it myself anyway
              </button>
            )}
          </>
        )}
      </div>

      {/* D. See what we found — collapsed */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowCauses(!showCauses)}
          className="w-full p-5 flex items-center justify-between text-left touch-manipulation min-h-[48px]"
        >
          <span className="font-heading text-lg text-foreground">See what we found</span>
          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showCauses ? "rotate-180" : ""}`} />
        </button>
        {showCauses && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 pb-5 space-y-4"
          >
            {result.causes.map((cause, i) => (
              <div key={cause.name} className="flex gap-3">
                <div className="shrink-0 w-12 text-right">
                  <span className="text-base font-bold text-foreground">{cause.probability}%</span>
                </div>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${cause.probability}%` }}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                    />
                  </div>
                  <p className="font-medium text-foreground text-sm">{cause.name}</p>
                  <p className="text-xs text-muted-foreground">{cause.explanation}</p>
                </div>
              </div>
            ))}

            {result.costEstimate && (
              <div className="pt-2 border-t border-border space-y-1">
                <p className="text-sm text-muted-foreground">DIY parts: <span className="text-foreground font-medium">${result.costEstimate.low}–${result.costEstimate.high}</span></p>
                <p className="text-sm text-muted-foreground">Pro estimate: <span className="text-foreground font-medium">${Math.round(result.costEstimate.low * 4)}–${Math.round(result.costEstimate.high * 4)}</span></p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* E. Feedback */}
      <div className="py-4">
        <AnimatePresence mode="wait">
          {feedbackState === "none" && (
            <motion.div key="ask" className="flex items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground mr-1">Was this helpful?</span>
              <button
                onClick={handleFeedbackUp}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-success hover:border-success/30 transition-colors touch-manipulation"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                onClick={handleFeedbackDown}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-danger hover:border-danger/30 transition-colors touch-manipulation"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {feedbackState === "up" && (
            <motion.div
              key="up"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-sm text-muted-foreground"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success mb-2"
              >
                <ThumbsUp className="h-4 w-4" />
              </motion.div>
              <p>Glad we could help. We'll check back tomorrow: did it fix it?</p>
            </motion.div>
          )}

          {feedbackState === "down" && (
            <motion.div
              key="down"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-sm mx-auto space-y-2"
            >
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What went wrong? (optional)"
                className="resize-none text-sm min-h-[60px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("[HomeOS] feedback_text", { text: feedbackText, timestamp: Date.now() });
                  setFeedbackState("up");
                }}
                className="touch-manipulation"
              >
                Send feedback
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky pro CTA on mobile */}
      <StickyProCTA onConsult={onConsult} show={showProCTA} />
    </motion.div>
  );
};

export default DiagnosisResults;
