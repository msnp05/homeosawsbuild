import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Wrench, Video, Users, Clock, RotateCcw,
  ChevronDown, Search, Sparkles, AlertTriangle, Info,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DiagnosisResultsProps {
  answers?: Record<string, string>;
  onGuidedFix: () => void;
  onProCall: () => void;
  onStartOver: () => void;
  isLowConfidence?: boolean;
}

const DiagnosisResults = ({ answers = {}, onGuidedFix, onProCall, onStartOver, isLowConfidence: isLowConfidenceProp = false }: DiagnosisResultsProps) => {
  const [localLowConfidence, setLocalLowConfidence] = useState(isLowConfidenceProp);
  const isGas = answers.fuel_type === "Gas (I see a gas line)";
  const ventDirty = answers.vent_cleaning === "It's been a while" || answers.vent_cleaning === "Never / Not sure";
  const topCause = isGas ? "Gas Valve Solenoid Coils" : "Blown Thermal Fuse";
  const partPrice = isGas ? "$18.99" : "$14.99";
  const partLabel = isGas
    ? "Gas Valve Coil Kit (279834)"
    : "Thermal Fuse Kit (DC47-00016A + DC96-00887C)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 overflow-x-hidden max-w-full"
    >
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Demo toggle */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setLocalLowConfidence((v) => !v)}
            className="text-[10px] text-muted-foreground/40 border border-muted rounded-full px-2 py-0.5 hover:text-muted-foreground/60 transition-colors"
          >
            Toggle: {localLowConfidence ? "Low" : "High"} Confidence
          </button>
        </div>
        {/* Success / Low Confidence banner */}
        {localLowConfidence ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-primary/10 border border-primary/20 p-5 mb-6"
          >
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-heading text-2xl text-foreground mb-1">
                  Complex Issue Detected
                </h2>
                <p className="text-foreground/80 text-sm break-words">
                  Your dryer has a complex symptom signature. To prevent ordering the wrong parts, let's get a certified tech on video to review the audio/video data we just collected.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-success/10 border border-success/20 p-5 mb-6"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
              <div>
              <h2 className="font-heading text-2xl text-foreground mb-1">
                  Good news: We know exactly what's wrong.
                </h2>
                <p className="font-heading text-3xl sm:text-4xl text-foreground font-bold mt-2 mb-1 break-words">{topCause}</p>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-success/20 rounded-full px-3 py-1">
                  <span className="text-sm font-bold text-success">91% Confident</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Vent warning banner */}
        {ventDirty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-warning/10 border border-warning/30 p-5 mb-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-semibold mb-1">⚠️ Root Cause Alert</p>
                <p className="text-sm text-foreground/80 break-words whitespace-normal">
                  A clogged vent causes 70%+ of thermal fuse failures. Clean your vent first — or the new fuse will blow again within weeks.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-6 px-1"
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You're not alone. <span className="text-foreground font-medium">842 homeowners</span> fixed this exact dryer themselves.
          </p>
        </motion.div>

        {/* AI Reasoning Card — only in high confidence */}
        {!localLowConfidence && <DiagnosticReasoning isGas={isGas} />}

        {/* Card A: Fix it myself — hidden in low confidence */}
        {!localLowConfidence && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-5 mb-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold text-lg">I'll fix it myself</h3>
                <p className="text-sm text-muted-foreground flex items-start gap-1">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    Takes ~15 mins · Parts: {partPrice} · Tools: Screwdriver, Multimeter
                  </span>
                </p>
              </div>
            </div>

            {/* Parts tooltip */}
            <PartsTooltip label={partLabel} isGas={isGas} />

            <button
              onClick={onGuidedFix}
              className="w-full h-14 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-lg shadow-accent/20 active:scale-[0.98] transition-transform touch-manipulation mt-3"
            >
              Start Guided Fix
            </button>
          </motion.div>
        )}

        {/* Card B: Talk to a pro — expanded in low confidence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: localLowConfidence ? 0.2 : 0.5 }}
          className={`glass-card rounded-2xl p-5 mb-6 ${localLowConfidence ? "border-2 border-primary/30" : ""}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">
                {localLowConfidence ? "Talk to a certified tech" : "I'd rather talk to a pro"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {localLowConfidence
                  ? "A pro will review your audio/video data live."
                  : "Video call a certified tech right now."}
              </p>
            </div>
          </div>
          {localLowConfidence && (
            <p className="text-sm text-muted-foreground mb-4 break-words">
              Your dryer has a complex symptom signature. To prevent ordering the wrong parts, let's get a certified tech on video to review the data we just collected.
            </p>
          )}
          <button
            onClick={onProCall}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform touch-manipulation"
          >
            Connect to Pro — $15
          </button>
        </motion.div>

        {/* Start over */}
        <div className="text-center mt-6">
          <button
            onClick={onStartOver}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* =================== Parts tooltip =================== */

const PartsTooltip = ({ label, isGas }: { label: string; isGas: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-muted/50 border border-border/50 p-3 mb-1">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground font-medium break-words pr-2">{label}</p>
        <button
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 text-accent hover:text-accent/80 transition-colors touch-manipulation"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-muted-foreground mt-2 break-words overflow-hidden"
          >
            {isGas
              ? "Gas valve coils weaken over time from heat cycling. Replacing both coils at once prevents a repeat failure."
              : "Why two parts? The thermal fuse and thermal cut-off always fail together under heat stress. Replace both to avoid a callback."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =================== Diagnostic Reasoning =================== */

const ELECTRIC_REASONING_STEPS = [
  { icon: CheckCircle2, color: "text-success", text: "Drum is spinning → Drive motor & belt are functioning." },
  { icon: CheckCircle2, color: "text-success", text: "No heat detected → Power is active, but heating circuit is broken." },
  { icon: Search, color: "text-accent", text: "Cross-referencing service manuals for heating circuit faults..." },
];

const GAS_REASONING_STEPS = [
  { icon: CheckCircle2, color: "text-success", text: "Drum is spinning → Drive motor & belt are functioning." },
  { icon: CheckCircle2, color: "text-success", text: "Gas igniter glows → Gas supply is reaching the burner assembly." },
  { icon: Search, color: "text-accent", text: "No sustained flame → Valve coils likely failing intermittently." },
];

const ELECTRIC_PROBABILITY_DATA = [
  { label: "Thermal Fuse / Cut-off Blown", pct: 58, note: "Usually caused by lint buildup" },
  { label: "Heating Element Failed", pct: 23, note: "Test with multimeter before ordering" },
  { label: "Cycling Thermostat", pct: 10 },
  { label: "High-Limit Thermostat", pct: 6 },
  { label: "Thermistor", pct: 3 },
];

const GAS_PROBABILITY_DATA = [
  { label: "Gas Valve Solenoid Coils", pct: 45, note: "Coils weaken with heat cycling over time" },
  { label: "Flat Igniter", pct: 30, note: "Draws insufficient current to open gas valve" },
  { label: "Flame Sensor", pct: 15 },
  { label: "Thermal Fuse", pct: 10 },
];

const DiagnosticReasoning = ({ isGas }: { isGas: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const steps = isGas ? GAS_REASONING_STEPS : ELECTRIC_REASONING_STEPS;
  const probData = isGas ? GAS_PROBABILITY_DATA : ELECTRIC_PROBABILITY_DATA;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl bg-muted/60 backdrop-blur-md border border-border/50 p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h4 className="text-sm font-semibold text-foreground">Diagnostic Reasoning</h4>
        </div>
        <span className="text-[10px] text-muted-foreground tracking-wide uppercase">Powered by AI</span>
      </div>

      <p className="text-sm text-muted-foreground mb-2">
        Analyzed <span className="text-foreground font-medium">{isGas ? "5" : "6"} components</span>.
        Ruled out motor & belt.
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors touch-manipulation"
      >
        <span>{expanded ? "Hide" : "View Full Breakdown"}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Timeline steps */}
            <div className="mt-4 space-y-0">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i < steps.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                  )}
                  <step.icon className={`h-[22px] w-[22px] flex-shrink-0 mt-0.5 ${step.color}`} />
                  <p className="text-sm text-foreground/80 pb-4 leading-relaxed break-words">{step.text}</p>
                </div>
              ))}
            </div>

            {/* Probability bars */}
            <div className="mt-2 pt-3 border-t border-border/50 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Failure Probability
              </p>
              {probData.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground break-words">{item.label}</span>
                    <span className="text-muted-foreground font-medium flex-shrink-0 ml-2">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                  {item.note && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{item.note}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiagnosisResults;
