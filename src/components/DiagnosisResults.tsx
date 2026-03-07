import { motion } from "framer-motion";
import { CheckCircle2, Wrench, Video, Users, Clock, RotateCcw, ChevronDown } from "lucide-react";
import { useState } from "react";

interface DiagnosisResultsProps {
  onGuidedFix: () => void;
  onProCall: () => void;
  onStartOver: () => void;
}

const DiagnosisResults = ({ onGuidedFix, onProCall, onStartOver }: DiagnosisResultsProps) => {
  const [showCauses, setShowCauses] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32"
    >
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Success banner */}
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
              <p className="text-foreground/80 text-base font-medium">
                Most likely: <span className="text-foreground font-semibold">Blown Thermal Fuse</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-8 px-1"
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You're not alone. <span className="text-foreground font-medium">842 homeowners</span> fixed this exact dryer themselves.
          </p>
        </motion.div>

        {/* Card A: Fix it myself */}
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
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 15 mins</span>
                <span>Parts: ~$12</span>
              </div>
            </div>
          </div>
          <button
            onClick={onGuidedFix}
            className="w-full h-14 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-lg shadow-accent/20 active:scale-[0.98] transition-transform touch-manipulation"
          >
            Start Guided Fix
          </button>
        </motion.div>

        {/* Card B: Talk to a pro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">I'd rather talk to a pro</h3>
              <p className="text-sm text-muted-foreground">Video call a certified tech right now.</p>
            </div>
          </div>
          <button
            onClick={onProCall}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform touch-manipulation"
          >
            Connect for $15
          </button>
        </motion.div>

        {/* Why we think this — collapsed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => setShowCauses(!showCauses)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation w-full justify-center py-2"
          >
            <span>Why we think this</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showCauses ? "rotate-180" : ""}`} />
          </button>
          {showCauses && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 rounded-xl bg-muted/50 p-4 space-y-3"
            >
              <CauseBar label="Blown Thermal Fuse" pct={78} />
              <CauseBar label="Broken Heating Element" pct={15} />
              <CauseBar label="Faulty Thermostat" pct={7} />
            </motion.div>
          )}
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

const CauseBar = ({ label, pct }: { label: string; pct: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-foreground">{label}</span>
      <span className="text-muted-foreground">{pct}%</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

export default DiagnosisResults;
