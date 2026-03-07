import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShoppingCart, Unplug, Wrench, PartyPopper, ExternalLink } from "lucide-react";

interface GuidedFixModeProps {
  onBack: () => void;
  onStartOver: () => void;
}

const STEPS = [
  { title: "Let's get your part", icon: ShoppingCart, content: "order" },
  { title: "Step 1 of 4: Unplug the machine", icon: Unplug, content: "unplug" },
  { title: "Step 2 of 4: Remove the back panel", icon: Wrench, content: "panel" },
  { title: "Step 3 of 4: Locate & replace the fuse", icon: Wrench, content: "replace" },
  { title: "Step 4 of 4: Reassemble & test", icon: Wrench, content: "test" },
  { title: "", icon: PartyPopper, content: "done" },
];

const GuidedFixMode = ({ onBack, onStartOver }: GuidedFixModeProps) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-60px)] flex flex-col"
    >
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {current.content === "order" && <OrderStep />}
            {current.content === "unplug" && <InstructionStep
              title="Step 1 of 4: Unplug the machine"
              description="Safety first. Unplug the dryer from the wall outlet. If it's a gas dryer, also turn off the gas supply valve."
              tip="Pull the dryer away from the wall gently. You may need a friend for heavy models."
            />}
            {current.content === "panel" && <InstructionStep
              title="Step 2 of 4: Remove the back panel"
              description="Using a Phillips-head screwdriver, remove the 6 screws holding the rear access panel."
              tip="Keep the screws in a small bowl — they're easy to lose!"
            />}
            {current.content === "replace" && <InstructionStep
              title="Step 3 of 4: Locate & replace the fuse"
              description="The thermal fuse is a small white plastic piece near the exhaust duct. Disconnect the two wires, remove the old fuse, and snap in the new one."
              tip="Take a photo of the wires before disconnecting so you remember the placement."
            />}
            {current.content === "test" && <InstructionStep
              title="Step 4 of 4: Reassemble & test"
              description="Screw the back panel on, plug the dryer back in, and run a test cycle with a damp towel for 10 minutes."
              tip="If the towel is warm and dry, you nailed it!"
            />}
            {current.content === "done" && <CompletionScreen onStartOver={onStartOver} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      {current.content !== "done" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-card/90 backdrop-blur-md flex gap-3">
          <button
            onClick={prev}
            className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center touch-manipulation active:scale-95 transition-transform flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={next}
            className="flex-1 h-14 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-lg shadow-accent/20 touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            {step === 0 ? "I've ordered the part" : "Next"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const OrderStep = () => (
  <div>
    <h2 className="font-heading text-3xl text-foreground mb-2">Let's get your part</h2>
    <p className="text-muted-foreground mb-6">You need one replacement part. We found it for you.</p>
    <div className="glass-card rounded-2xl p-5">
      <div className="flex gap-4">
        <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-foreground font-semibold">Samsung Thermal Fuse DC47</h3>
          <p className="text-accent font-bold text-lg">$12.80</p>
          <p className="text-sm text-success font-medium">Delivers Today</p>
        </div>
      </div>
      <button className="mt-4 w-full h-12 rounded-xl bg-foreground text-background font-semibold flex items-center justify-center gap-2 touch-manipulation active:scale-[0.98] transition-transform">
        <ExternalLink className="h-4 w-4" />
        Buy on Amazon
      </button>
    </div>
  </div>
);

const InstructionStep = ({ title, description, tip }: { title: string; description: string; tip: string }) => (
  <div>
    <h2 className="font-heading text-2xl text-foreground mb-4">{title}</h2>
    <div className="relative rounded-2xl bg-muted/50 h-48 mb-6 overflow-hidden flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <Wrench className="h-10 w-10 mx-auto mb-2 text-accent" />
        <p className="text-sm">AR Overlay</p>
      </div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-4 right-6 h-8 w-8 rounded-full bg-accent flex items-center justify-center shadow-lg"
      >
        <ArrowRight className="h-4 w-4 text-accent-foreground -rotate-90" />
      </motion.div>
    </div>
    <p className="text-foreground text-base leading-relaxed mb-4">{description}</p>
    <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
      <p className="text-sm text-foreground"><span className="font-semibold">💡 Tip:</span> {tip}</p>
    </div>
  </div>
);

const CompletionScreen = ({ onStartOver }: { onStartOver: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      className="h-20 w-20 rounded-full bg-success/15 flex items-center justify-center mb-6"
    >
      <PartyPopper className="h-10 w-10 text-success" />
    </motion.div>
    <h2 className="font-heading text-3xl text-foreground mb-2">You did it! 🎉</h2>
    <p className="text-lg text-muted-foreground mb-2">
      You just saved <span className="text-success font-bold">~$185</span> on a repair tech.
    </p>
    <p className="text-sm text-muted-foreground mb-8">
      Total cost: $12.80 for the part + 15 minutes of your time.
    </p>
    <button
      onClick={onStartOver}
      className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-semibold touch-manipulation active:scale-[0.98] transition-transform"
    >
      Back to Home
    </button>
  </motion.div>
);

export default GuidedFixMode;
