import { motion } from "framer-motion";
import { PartyPopper, RotateCcw } from "lucide-react";

const FixedCelebration = ({ onStartOver }: { onStartOver: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[calc(100dvh-60px)] text-center px-6"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      className="h-24 w-24 rounded-full bg-success/15 flex items-center justify-center mb-6"
    >
      <PartyPopper className="h-12 w-12 text-success" />
    </motion.div>
    <h2 className="font-heading text-3xl text-foreground mb-3">That did it! 🎉</h2>
    <p className="text-lg text-muted-foreground mb-2 max-w-sm break-words">
      A half-tripped 240V breaker is one of the most common "no heat" causes — and it costs{" "}
      <span className="text-success font-bold">$0</span> to fix.
    </p>
    <p className="text-sm text-muted-foreground mb-8">
      No parts needed. No service call. You just saved yourself ~$150.
    </p>
    <button
      onClick={onStartOver}
      className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-semibold touch-manipulation active:scale-[0.98] transition-transform inline-flex items-center gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Back to Home
    </button>
  </motion.div>
);

export default FixedCelebration;
