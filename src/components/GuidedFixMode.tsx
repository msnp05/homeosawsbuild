import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ShoppingCart, Unplug, Wrench,
  PartyPopper, ExternalLink, Check, Package
} from "lucide-react";

interface GuidedFixModeProps {
  onBack: () => void;
  onStartOver: () => void;
}

type PrepPhase = "inventory" | "cart" | "transitioning" | null;

const TOOLS = [
  { id: "screwdriver", label: "Phillips Screwdriver", price: 5.0 },
  { id: "nutdriver", label: '1/4-inch Nut Driver', price: 5.0 },
  { id: "multimeter", label: "Digital Multimeter", price: 9.99 },
];

const REPAIR_STEPS = [
  { title: "Step 1 of 4: Unplug the machine", icon: Unplug, content: "unplug" },
  { title: "Step 2 of 4: Remove the back panel", icon: Wrench, content: "panel" },
  { title: "Step 3 of 4: Locate & replace the fuse", icon: Wrench, content: "replace" },
  { title: "Step 4 of 4: Reassemble & test", icon: Wrench, content: "test" },
  { title: "", icon: PartyPopper, content: "done" },
];

const GuidedFixMode = ({ onBack, onStartOver }: GuidedFixModeProps) => {
  const [prepPhase, setPrepPhase] = useState<PrepPhase>("inventory");
  const [ownedTools, setOwnedTools] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(0);

  const toggleTool = (id: string) => {
    setOwnedTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cartTotal = useMemo(() => {
    let total = 12.80; // fuse kit always
    TOOLS.forEach((t) => {
      if (!ownedTools.has(t.id)) total += t.price;
    });
    return total;
  }, [ownedTools]);

  const missingTools = TOOLS.filter((t) => !ownedTools.has(t.id));

  // Repair step navigation
  const current = REPAIR_STEPS[step];
  const next = () => setStep((s) => Math.min(s + 1, REPAIR_STEPS.length - 1));
  const prev = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  // Progress: prep phases count as 0-2, repair steps start at 3
  const totalSteps = 3 + REPAIR_STEPS.length;
  const currentProgress = prepPhase === "inventory" ? 1 : prepPhase === "cart" ? 2 : prepPhase === "transitioning" ? 3 : 3 + step + 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-60px)] flex flex-col"
    >
      {/* Progress bar */}
      {prepPhase !== "transitioning" && (
        <div className="px-4 pt-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${(currentProgress / totalSteps) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        <AnimatePresence mode="wait">
          {prepPhase === "inventory" && (
            <InventoryCheck
              key="inventory"
              ownedTools={ownedTools}
              onToggle={toggleTool}
              onNext={() => setPrepPhase("cart")}
              onBack={onBack}
            />
          )}
          {prepPhase === "cart" && (
            <SmartCart
              key="cart"
              missingTools={missingTools}
              total={cartTotal}
              onOrder={() => setPrepPhase("transitioning")}
              onBack={() => setPrepPhase("inventory")}
            />
          )}
          {prepPhase === "transitioning" && (
            <TransitionScreen
              key="transition"
              onStart={() => {
                setPrepPhase(null);
                setStep(0);
              }}
            />
          )}
          {prepPhase === null && (
            <motion.div
              key={`repair-${step}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {current.content === "unplug" && <InstructionStep title="Step 1 of 4: Unplug the machine" description="Safety first. Unplug the dryer from the wall outlet. If it's a gas dryer, also turn off the gas supply valve." tip="Pull the dryer away from the wall gently. You may need a friend for heavy models." />}
              {current.content === "panel" && <InstructionStep title="Step 2 of 4: Remove the back panel" description="Using a Phillips-head screwdriver, remove the 6 screws holding the rear access panel." tip="Keep the screws in a small bowl — they're easy to lose!" />}
              {current.content === "replace" && <InstructionStep title="Step 3 of 4: Locate & replace the fuse" description="The thermal fuse is a small white plastic piece near the exhaust duct. Disconnect the two wires, remove the old fuse, and snap in the new one." tip="Take a photo of the wires before disconnecting so you remember the placement." />}
              {current.content === "test" && <InstructionStep title="Step 4 of 4: Reassemble & test" description="Screw the back panel on, plug the dryer back in, and run a test cycle with a damp towel for 10 minutes." tip="If the towel is warm and dry, you nailed it!" />}
              {current.content === "done" && <CompletionScreen onStartOver={onStartOver} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom nav — only for repair steps */}
      {prepPhase === null && current.content !== "done" && (
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
            Next
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

/* =================== PREP PHASE SCREENS =================== */

const InventoryCheck = ({
  ownedTools,
  onToggle,
  onNext,
  onBack,
}: {
  ownedTools: Set<string>;
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.25 }}
  >
    <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-2 break-words">Do you have these tools at home?</h2>
    <p className="text-muted-foreground mb-6">Tap the ones you already own.</p>

    <div className="space-y-3 mb-32">
      {TOOLS.map((tool) => {
        const owned = ownedTools.has(tool.id);
        return (
          <motion.button
            key={tool.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onToggle(tool.id)}
            className={`w-full min-h-[56px] rounded-2xl p-4 flex items-center gap-4 border-2 transition-colors touch-manipulation ${
              owned
                ? "border-success bg-success/10"
                : "border-border bg-card"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              owned ? "bg-success/20" : "bg-muted"
            }`}>
              {owned ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Check className="h-5 w-5 text-success" />
                </motion.div>
              ) : (
                <Wrench className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <span className="text-foreground font-medium text-base text-left">{tool.label}</span>
          </motion.button>
        );
      })}
    </div>

    {/* Sticky bottom */}
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-card/90 backdrop-blur-md flex gap-3">
      <button
        onClick={onBack}
        className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center touch-manipulation active:scale-95 transition-transform flex-shrink-0"
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={onNext}
        className="flex-1 h-14 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-lg shadow-accent/20 touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        Next Step
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  </motion.div>
);

const SmartCart = ({
  missingTools,
  total,
  onOrder,
  onBack,
}: {
  missingTools: typeof TOOLS;
  total: number;
  onOrder: () => void;
  onBack: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.25 }}
  >
    <h2 className="font-heading text-3xl text-foreground mb-2">Let's get what you're missing.</h2>
    <p className="text-muted-foreground mb-6">Everything ships with Prime.</p>

    <div className="glass-card rounded-2xl p-5 space-y-4 mb-32">
      {/* Always-present fuse kit */}
      <CartItem label="Samsung Thermal Fuse Kit" price="$12.80" required />

      {/* Conditional missing tools */}
      {missingTools.map((t) => (
        <CartItem key={t.id} label={t.label} price={`$${t.price.toFixed(2)}`} />
      ))}

      {missingTools.length === 0 && (
        <p className="text-sm text-success font-medium">✓ You have all the tools you need!</p>
      )}
    </div>

    {/* Sticky bottom */}
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-card/90 backdrop-blur-md">
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-muted-foreground text-sm">Total</span>
        <span className="text-foreground font-bold text-xl">${total.toFixed(2)}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center touch-manipulation active:scale-95 transition-transform flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={onOrder}
          className="flex-1 h-14 rounded-xl bg-foreground text-background font-semibold text-base touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Order with Amazon Prime
        </button>
      </div>
    </div>
  </motion.div>
);

const CartItem = ({ label, price, required }: { label: string; price: string; required?: boolean }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        {required ? <ShoppingCart className="h-4 w-4 text-muted-foreground" /> : <Wrench className="h-4 w-4 text-muted-foreground" />}
      </div>
      <span className="text-foreground text-sm font-medium">{label}</span>
    </div>
    <span className="text-accent font-bold">{price}</span>
  </div>
);

const TransitionScreen = ({ onStart }: { onStart: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center text-center px-6"
    >
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.p key="p0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-2xl text-foreground font-heading">
            Fast forward 24 hours...
          </motion.p>
        )}
        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <Package className="h-16 w-16 text-accent" />
            </motion.div>
            <p className="text-2xl text-foreground font-heading">📦 Ding! Your delivery has arrived.</p>
          </motion.div>
        )}
        {phase >= 2 && (
          <motion.div key="p2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
            <Package className="h-16 w-16 text-accent" />
            <p className="text-2xl text-foreground font-heading">📦 Your delivery has arrived.</p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="h-14 px-10 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-lg shadow-accent/20 touch-manipulation"
            >
              Start the Repair
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* =================== EXISTING REPAIR SCREENS (preserved) =================== */

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
