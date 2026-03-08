import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Mic, MicOff, X, Activity, AudioLines } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import dryerImage from "@/assets/dryer-viewfinder.jpg";

interface LiveScannerProps {
  onAnalyze: () => void;
  onBack: () => void;
  onFixed: () => void;
}

const TRANSCRIPT_WORDS = [
  "The drum is...",
  "spinning...",
  "but the clothes...",
  "are still completely...",
  "wet and cold...",
];

const MACHINE_STATUSES = [
  { text: "Detecting motor frequency...", type: "neutral" as const },
  { text: "Motor running normally ✓", type: "good" as const },
  { text: "No grinding or belt noise detected ✓", type: "good" as const },
  { text: "Heating element circuit — silent ⚠️", type: "warn" as const },
];

type ConfidenceStage = 0 | 1 | 2 | 3 | 4;

const CONFIDENCE_STAGES: { target: number; label: string }[] = [
  { target: 28, label: "Building baseline..." },
  { target: 54, label: "Motor & belt eliminated..." },
  { target: 71, label: "Heating circuit isolated..." },
  { target: 91, label: "High confidence. Ready." },
];

const LiveScanner = ({ onAnalyze, onBack, onFixed }: LiveScannerProps) => {
  const [recognized, setRecognized] = useState(false);
  const [muted, setMuted] = useState(false);

  // Model sticker verification phase
  const [stickerPhase, setStickerPhase] = useState<"scanning" | "confirmed" | "done">("scanning");

  // Machine audio
  const [machineStatusIdx, setMachineStatusIdx] = useState(0);

  // Voice transcription
  const [visibleWords, setVisibleWords] = useState(0);

  // Confidence
  const [confidenceStage, setConfidenceStage] = useState<ConfidenceStage>(0);
  const [confidence, setConfidence] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hapticPulse, setHapticPulse] = useState(0);

  // Clarifying question
  const [showQuestion, setShowQuestion] = useState(false);
  const [showBreakerHelper, setShowBreakerHelper] = useState(false);

  // Model sticker verification sequence (3 seconds total)
  useEffect(() => {
    const t1 = setTimeout(() => setStickerPhase("confirmed"), 2000);
    const t2 = setTimeout(() => setStickerPhase("done"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // AR recognition — starts after sticker phase
  useEffect(() => {
    if (stickerPhase !== "done") return;
    const t = setTimeout(() => setRecognized(true), 1500);
    return () => clearTimeout(t);
  }, [stickerPhase]);

  // Machine status cycling (every 2s) — only after sticker done
  useEffect(() => {
    if (paused || stickerPhase !== "done") return;
    const interval = setInterval(() => {
      setMachineStatusIdx((p) => Math.min(p + 1, MACHINE_STATUSES.length - 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [paused]);

  // Voice transcription word-by-word
  useEffect(() => {
    if (muted || paused) return;
    if (visibleWords >= TRANSCRIPT_WORDS.length) return;
    const t = setTimeout(() => setVisibleWords((w) => w + 1), 1200);
    return () => clearTimeout(t);
  }, [visibleWords, muted, paused]);

  // Confidence progression
  useEffect(() => {
    if (paused) return;
    const timers = [
      setTimeout(() => { setConfidenceStage(1); }, 2000),
      setTimeout(() => { setConfidenceStage(2); }, 5000),
      setTimeout(() => { setConfidenceStage(3); }, 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [paused]);

  // Animate confidence value + haptic pulse on stage change
  useEffect(() => {
    if (confidenceStage === 0) return;
    // Trigger haptic pulse
    setHapticPulse((p) => p + 1);
    if (navigator.vibrate) navigator.vibrate(30);
    // Stage 4 = after answering question
    const stageIdx = confidenceStage >= 4 ? 3 : confidenceStage - 1;
    const target = CONFIDENCE_STAGES[stageIdx].target;
    const interval = setInterval(() => {
      setConfidence((c) => {
        if (c >= target) { clearInterval(interval); return target; }
        return c + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [confidenceStage]);

  // Pause at stage 3 (71%) and show question
  useEffect(() => {
    if (confidenceStage === 3 && confidence >= 71 && !paused) {
      setPaused(true);
      setTimeout(() => setShowQuestion(true), 400);
    }
  }, [confidenceStage, confidence, paused]);

  // Auto-advance after stage 4
  useEffect(() => {
    if (confidenceStage >= 4 && confidence >= 89) {
      const t = setTimeout(onAnalyze, 1000);
      return () => clearTimeout(t);
    }
  }, [confidenceStage, confidence, onAnalyze]);

  const handleBreakerFine = useCallback(() => {
    setShowQuestion(false);
    setConfidenceStage(4);
    setConfidence(71);
    // Will animate to 91
    setTimeout(() => setConfidence(71), 50);
  }, []);

  const handleBreakerCheck = useCallback(() => {
    setShowBreakerHelper(true);
  }, []);

  const handleBreakerFixed = useCallback(() => {
    onFixed();
  }, [onFixed]);

  const handleStillBroken = useCallback(() => {
    setShowQuestion(false);
    setShowBreakerHelper(false);
    setConfidenceStage(4);
    setConfidence(71);
  }, []);

  const confidenceColor =
    confidence <= 50 ? "bg-danger" : confidence <= 79 ? "bg-warning" : "bg-success";

  const currentStageLabel =
    confidenceStage === 0
      ? "Initializing..."
      : confidenceStage >= 4
      ? CONFIDENCE_STAGES[3].label
      : CONFIDENCE_STAGES[confidenceStage - 1].label;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/95 flex flex-col h-[100dvh] overflow-hidden"
    >
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-card/10 backdrop-blur-md touch-manipulation">
          <ArrowLeft className="h-5 w-5 text-primary-foreground" />
        </button>
        <span className="text-primary-foreground/70 text-sm font-medium">Scanning</span>
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-card/10 backdrop-blur-md touch-manipulation">
          <X className="h-5 w-5 text-primary-foreground" />
        </button>
      </div>

      {/* Confidence Bar */}
      <motion.div
        key={hapticPulse}
        initial={hapticPulse > 0 ? { scale: 1.06 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="px-4 pb-2"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-primary-foreground/60 font-medium">{currentStageLabel}</span>
          <motion.span
            key={`pct-${hapticPulse}`}
            initial={hapticPulse > 0 ? { scale: 1.3 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="text-xs text-primary-foreground/80 font-bold"
          >
            {confidence}%
          </motion.span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-card/20 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${confidenceColor} transition-colors duration-500`}
            initial={{ width: "0%" }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Viewfinder area */}
      <div className="flex-1 relative mx-4 my-2 rounded-2xl overflow-hidden min-h-0">
        <img src={dryerImage} alt="Dryer viewfinder" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-foreground/40" />

        {/* Mic indicator */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 flex items-center gap-2 bg-card/20 backdrop-blur-xl rounded-full px-3 py-1.5"
        >
          <motion.div
            animate={{ scale: muted ? 1 : [1, 1.3, 1], opacity: muted ? 0.4 : [1, 0.6, 1] }}
            transition={{ repeat: muted ? 0 : Infinity, duration: 1.2 }}
            className={`h-2.5 w-2.5 rounded-full ${muted ? "bg-muted-foreground" : "bg-danger"}`}
          />
          <span className="text-xs text-primary-foreground/80 font-medium">
            {muted ? "Mic muted" : "Dual-channel"}
          </span>
        </motion.div>

        {/* AR Bounding Box */}
        <AnimatePresence>
          {recognized && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-[12%] border-2 border-accent rounded-2xl"
            >
              <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-3 border-l-3 border-accent rounded-tl-lg" />
              <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-3 border-r-3 border-accent rounded-tr-lg" />
              <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-3 border-l-3 border-accent rounded-bl-lg" />
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-3 border-r-3 border-accent rounded-br-lg" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-xl rounded-full px-4 py-2 shadow-xl flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Recognized: Samsung DV42H</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dual-channel audio panels */}
      <div className="px-4 py-2 space-y-2 pb-32 max-w-full overflow-x-hidden">
        {/* Panel A: Machine Sound */}
        <div className="bg-card/10 backdrop-blur-xl rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wide">Listening to your dryer...</span>
          </div>
          {/* Waveform */}
          <div className="flex items-center justify-center gap-[3px] h-10 mb-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-accent/70"
                animate={{
                  height: paused ? [8, 8] : [6, 14 + Math.sin(i * 0.8) * 12, 6],
                }}
                transition={{
                  repeat: paused ? 0 : Infinity,
                  duration: 0.6 + Math.random() * 0.6,
                  delay: i * 0.04,
                  ease: "easeInOut",
                }}
                style={{ minHeight: 4 }}
              />
            ))}
          </div>
          {/* Machine status */}
          <AnimatePresence mode="wait">
            <motion.p
              key={machineStatusIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`text-xs font-medium ${
                MACHINE_STATUSES[machineStatusIdx].type === "good"
                  ? "text-success"
                  : MACHINE_STATUSES[machineStatusIdx].type === "warn"
                  ? "text-warning"
                  : "text-primary-foreground/60"
              }`}
            >
              {MACHINE_STATUSES[machineStatusIdx].text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Panel B: Your Voice */}
        <div className="bg-card/10 backdrop-blur-xl rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AudioLines className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wide">Listening to you...</span>
            </div>
            {!muted && (
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="h-2 w-2 rounded-full bg-danger"
                />
                <span className="text-[10px] text-danger/80 font-medium">Recording</span>
              </div>
            )}
          </div>
          <div className="min-h-[36px]">
            {muted ? (
              <p className="text-xs text-primary-foreground/40 italic">Microphone muted</p>
            ) : (
              <p className="text-sm text-primary-foreground/90 italic leading-relaxed break-words whitespace-normal">
                "{TRANSCRIPT_WORDS.slice(0, visibleWords).join(" ")}
                {visibleWords < TRANSCRIPT_WORDS.length && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-0.5 h-3.5 bg-primary-foreground/70 ml-0.5 align-middle"
                  />
                )}
                "
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom mute toggle */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-card/90 backdrop-blur-md z-30">
        <div className="flex gap-3">
          <motion.button
            onClick={() => setMuted((m) => !m)}
            whileTap={{ scale: 0.95 }}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center touch-manipulation transition-colors ${
              muted ? "bg-danger/20 border border-danger/30" : "bg-card/50 border border-border/30"
            }`}
          >
            {muted ? (
              <MicOff className="h-5 w-5 text-danger" />
            ) : (
              <div className="relative">
                <Mic className="h-5 w-5 text-accent" />
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="absolute inset-0 rounded-full bg-accent/40"
                />
              </div>
            )}
          </motion.button>
          <div className="flex-1 h-14 rounded-2xl bg-card/30 border border-border/20 flex items-center justify-center">
            <span className="text-primary-foreground/50 text-sm font-medium">
              {confidence < 71 ? "Analyzing..." : "Waiting for input..."}
            </span>
          </div>
        </div>
      </div>

      {/* Clarifying Question Slide-up */}
      <AnimatePresence>
        {showQuestion && !showBreakerHelper && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 bg-card rounded-t-3xl shadow-2xl p-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            <h3 className="font-heading text-lg text-foreground mb-1">One quick question to be sure:</h3>
            <p className="text-sm text-muted-foreground mb-5 break-words whitespace-normal">
              Did you check your circuit breaker? A half-tripped breaker lets the drum spin but kills the heat.
            </p>
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBreakerFine}
                className="w-full h-14 rounded-2xl bg-accent text-accent-foreground font-semibold text-base touch-manipulation"
              >
                Yes, breaker is fine
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBreakerCheck}
                className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-base touch-manipulation"
              >
                Actually, let me check
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breaker Helper Overlay */}
      <AnimatePresence>
        {showBreakerHelper && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 bg-card rounded-t-3xl shadow-2xl p-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            <h3 className="font-heading text-lg text-foreground mb-2">Check your breaker panel</h3>
            <p className="text-sm text-muted-foreground mb-5 break-words whitespace-normal">
              Go check your breaker panel now. Flip the switch for the dryer fully OFF, then back ON. Come back and tell us if that fixed it.
            </p>
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBreakerFixed}
                className="w-full h-14 rounded-2xl bg-success text-success-foreground font-semibold text-base touch-manipulation"
              >
                That fixed it! 🎉
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleStillBroken}
                className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-base touch-manipulation"
              >
                Still no heat
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveScanner;
