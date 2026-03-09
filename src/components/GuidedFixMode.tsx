import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ShoppingCart, Unplug, Wrench,
  PartyPopper, Check, Package, Zap, AlertCircle, Info,
  LifeBuoy, X as XIcon, AlertTriangle, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface GuidedFixModeProps {
  answers?: Record<string, string>;
  onBack: () => void;
  onStartOver: () => void;
  onProCall?: () => void;
}

type PrepPhase = "inventory" | "cart" | "transitioning" | null;

const TOOLS = [
  { id: "screwdriver", label: "Phillips Screwdriver", price: 5.0 },
  { id: "nutdriver", label: '1/4-inch Nut Driver', price: 5.0 },
  { id: "multimeter", label: "Digital Multimeter", price: 9.99 },
];

const ELECTRIC_PARTS = [
  { id: "thermal_fuse", label: "Thermal Fuse Kit (DC47-00016A + DC96-00887C)", price: 14.99, testLabel: "Test Thermal Fuse", testHint: "If open (no beep) = bad, order replacement" },
  { id: "heating_element", label: "Heating Element (DC47-00023A)", price: 34.99, testLabel: "Test Heating Element", testHint: "If open (no beep) = bad, order replacement" },
  { id: "cycling_thermostat", label: "Cycling Thermostat (DC47-00018A)", price: 12.99, testLabel: "Test Cycling Thermostat", testHint: "If open (no beep) = bad, order replacement" },
];

const GAS_PARTS = [
  { id: "gas_coils", label: "Gas Valve Coil Kit (279834)", price: 18.99, testLabel: "Test Gas Valve Coils", testHint: "If resistance is off-spec = bad" },
  { id: "igniter", label: "Flat Igniter (279311)", price: 22.99, testLabel: "Test Igniter", testHint: "If no glow or cracked = bad" },
  { id: "flame_sensor", label: "Flame Sensor (338906)", price: 8.99, testLabel: "Test Flame Sensor", testHint: "If open circuit = bad" },
];

const REPAIR_STEPS = [
  { title: "Step 1 of 5: Unplug the machine", icon: Unplug, content: "unplug" },
  { title: "Step 2 of 5: Remove the back panel", icon: Wrench, content: "panel" },
  { title: "Step 3 of 5: Test before you replace", icon: Zap, content: "continuity" },
  { title: "Step 4 of 5: Locate & replace", icon: Wrench, content: "replace" },
  { title: "Step 5 of 5: Reassemble & test", icon: Wrench, content: "test" },
  { title: "", icon: PartyPopper, content: "done" },
];

/* =================== SVG ILLUSTRATIONS =================== */

const VisualUnplug = () => (
  <svg viewBox="0 0 280 160" className="w-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="160" y="30" width="80" height="100" rx="8" className="fill-muted stroke-border" strokeWidth="2"/>
    <rect x="180" y="55" width="8" height="18" rx="2" className="fill-muted-foreground/40"/>
    <rect x="196" y="55" width="8" height="18" rx="2" className="fill-muted-foreground/40"/>
    <circle cx="200" cy="95" r="6" className="fill-muted-foreground/40"/>
    <rect x="172" y="45" width="56" height="70" rx="4" className="stroke-border fill-transparent" strokeWidth="1.5"/>
    <rect x="60" y="55" width="60" height="50" rx="6" className="fill-accent/20 stroke-accent" strokeWidth="2"/>
    <rect x="75" y="42" width="6" height="16" rx="2" className="fill-accent/60"/>
    <rect x="90" y="42" width="6" height="16" rx="2" className="fill-accent/60"/>
    <circle cx="90" cy="95" r="5" className="fill-accent/60"/>
    <path d="M 125 80 L 155 80" className="stroke-foreground/30" strokeWidth="2" strokeDasharray="4 3"/>
    <path d="M 150 74 L 160 80 L 150 86" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="62" y="125" className="fill-muted-foreground" fontSize="9" fontFamily="system-ui">240V 4-prong</text>
    <text x="165" y="142" className="fill-muted-foreground" fontSize="9" fontFamily="system-ui">Wall outlet</text>
  </svg>
);

const VisualBackPanel = () => (
  <svg viewBox="0 0 280 160" className="w-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="20" width="200" height="125" rx="4" className="fill-muted/60 stroke-border" strokeWidth="2"/>
    <circle cx="140" cy="82" r="28" className="fill-muted stroke-border" strokeWidth="1.5"/>
    <circle cx="140" cy="82" r="20" className="fill-background/50 stroke-border/50" strokeWidth="1"/>
    {[[55,35],[225,35],[55,130],[225,130],[55,82],[225,82]].map(([cx,cy],i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="7" className="fill-muted stroke-accent" strokeWidth="1.5"/>
        <line x1={cx-3} y1={cy} x2={cx+3} y2={cy} className="stroke-accent" strokeWidth="1.5"/>
        <line x1={cx} y1={cy-3} x2={cx} y2={cy+3} className="stroke-accent" strokeWidth="1.5"/>
      </g>
    ))}
    <text x="100" y="155" className="fill-muted-foreground" fontSize="9" fontFamily="system-ui">Remove 6 screws — #2 Phillips</text>
  </svg>
);

const VisualReplaceFuse = ({ isGas }: { isGas: boolean }) => (
  <svg viewBox="0 0 280 160" className="w-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="60" width="160" height="45" rx="4" className="fill-muted/60 stroke-border" strokeWidth="2"/>
    <text x="60" y="88" className="fill-muted-foreground" fontSize="10" fontFamily="system-ui">Exhaust duct</text>
    <rect x="195" y="70" width="55" height="26" rx="4" className="fill-accent/20 stroke-accent" strokeWidth="2"/>
    <text x="199" y="83" className="fill-accent" fontSize="8" fontFamily="system-ui" fontWeight="600">
      {isGas ? "Coil pack" : "Thermal fuse"}
    </text>
    <text x="199" y="93" className="fill-accent/70" fontSize="7" fontFamily="system-ui">White plastic</text>
    <line x1="195" y1="80" x2="190" y2="80" className="stroke-foreground/40" strokeWidth="2"/>
    <line x1="195" y1="87" x2="190" y2="87" className="stroke-foreground/40" strokeWidth="2"/>
    <path d="M 178 83 L 192 83" className="stroke-destructive" strokeWidth="2"/>
    <path d="M 186 78 L 193 83 L 186 88" className="stroke-destructive" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="30" y="118" width="165" height="22" rx="4" className="fill-warning/10 stroke-warning/30" strokeWidth="1"/>
    <text x="42" y="131" className="fill-warning" fontSize="8.5" fontFamily="system-ui">📷 Photo the wires before disconnecting</text>
  </svg>
);

const VisualMultimeter = ({ isGas }: { isGas: boolean }) => (
  <svg viewBox="0 0 280 165" className="w-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="90" height="135" rx="10" className="fill-muted/80 stroke-border" strokeWidth="2"/>
    <rect x="24" y="25" width="72" height="35" rx="4" className="fill-background stroke-border/50" strokeWidth="1"/>
    <text x="36" y="48" className="fill-success" fontSize="18" fontFamily="monospace" fontWeight="bold">
      {isGas ? "0.52" : "----"}
    </text>
    <circle cx="60" cy="100" r="22" className="fill-background stroke-border" strokeWidth="1.5"/>
    <text x="51" y="97" className="fill-foreground" fontSize="8" fontFamily="system-ui">{isGas ? "Ω" : "🔊"}</text>
    <text x="46" y="107" className="fill-accent" fontSize="7" fontFamily="system-ui">← set here</text>
    <circle cx="45" cy="140" r="4" className="fill-destructive"/>
    <circle cx="75" cy="140" r="4" className="fill-foreground/60"/>
    <path d="M 45 144 Q 45 165 120 155 Q 185 148 220 95" className="stroke-destructive" strokeWidth="2" strokeDasharray="5 3" fill="none"/>
    <path d="M 75 144 Q 75 168 140 162 Q 200 158 230 110" className="stroke-foreground/50" strokeWidth="2" strokeDasharray="5 3" fill="none"/>
    <rect x="205" y="75" width="55" height="28" rx="5" className="fill-accent/15 stroke-accent" strokeWidth="2"/>
    <text x="210" y="88" className="fill-accent" fontSize="8" fontFamily="system-ui" fontWeight="600">
      {isGas ? "Gas coil" : "Thermal fuse"}
    </text>
    <text x="210" y="98" className="fill-muted-foreground" fontSize="7" fontFamily="system-ui">touch both leads</text>
    <circle cx="213" cy="76" r="3.5" className="fill-destructive"/>
    <circle cx="248" cy="76" r="3.5" className="fill-foreground/50"/>
    <rect x="15" y="155" width="250" height="18" rx="3" className="fill-muted/50"/>
    <text x="22" y="167" className="fill-success" fontSize="8" fontFamily="system-ui">
      {isGas ? "✓ In spec = good   ✗ Off-spec = replace" : "✓ Beep = good   ✗ No beep = replace"}
    </text>
  </svg>
);

const GuidedFixMode = ({ answers = {}, onBack, onStartOver, onProCall }: GuidedFixModeProps) => {
  const isGas = answers.fuel_type === "Gas (I see a gas line)";
  const PARTS = isGas ? GAS_PARTS : ELECTRIC_PARTS;

  const [prepPhase, setPrepPhase] = useState<PrepPhase>("inventory");
  const [failedParts, setFailedParts] = useState<Set<string>>(new Set());
  const [ownedTools, setOwnedTools] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(0);
  const [showSOS, setShowSOS] = useState(false);

  const toggleFailedPart = (id: string) => {
    setFailedParts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTool = (id: string) => {
    setOwnedTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Cart parts: failed parts, or default to first part if none selected
  const cartParts = useMemo(() => {
    if (failedParts.size === 0) return [PARTS[0]];
    return PARTS.filter((p) => failedParts.has(p.id));
  }, [failedParts, PARTS]);

  const cartTotal = useMemo(() => {
    let total = cartParts.reduce((sum, p) => sum + p.price, 0);
    TOOLS.forEach((t) => {
      if (!ownedTools.has(t.id)) total += t.price;
    });
    return total;
  }, [cartParts, ownedTools]);

  const missingTools = TOOLS.filter((t) => !ownedTools.has(t.id));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const current = REPAIR_STEPS[step];
  const next = () => setStep((s) => Math.min(s + 1, REPAIR_STEPS.length - 1));
  const prev = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  const totalSteps = 3 + REPAIR_STEPS.length;
  const currentProgress =
    prepPhase === "inventory" ? 1 :
    prepPhase === "cart" ? 2 :
    prepPhase === "transitioning" ? 3 :
    3 + step + 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100dvh-60px)] flex flex-col overflow-x-hidden max-w-full"
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
      <div className="flex-1 container mx-auto px-4 py-6 max-w-lg pb-36">
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
              cartParts={cartParts}
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
              {current.content === "unplug" && <InstructionStep title="Step 1 of 5: Unplug the machine" description="Safety first. Unplug the dryer from the wall outlet. If it's a gas dryer, also turn off the gas supply valve." tip="Pull the dryer away from the wall gently. You may need a friend for heavy models." />}
              {current.content === "panel" && <InstructionStep title="Step 2 of 5: Remove the back panel" description="Using a Phillips-head screwdriver, remove the 6 screws holding the rear access panel." tip="Keep the screws in a small bowl — they're easy to lose!" />}
              {current.content === "continuity" && (
                <ContinuityTestInline
                  parts={PARTS}
                  failedParts={failedParts}
                  onToggle={toggleFailedPart}
                  isGas={isGas}
                />
              )}
              {current.content === "replace" && !isGas && <InstructionStep title="Step 4 of 5: Replace the thermal fuse" description="The thermal fuse is a small white plastic piece on the exhaust duct. Disconnect the two wires, remove the old fuse, and snap in the new one. Replace both pieces in the kit." tip="Take a photo of the wires before disconnecting — they only go back one way." />}
              {current.content === "replace" && isGas && <InstructionStep title="Step 4 of 5: Replace the gas valve coils" description="The coil pack is clipped onto the front of the gas valve body. Remove the two wire connectors and the mounting clip, then slide off the old coils and press the new kit into place." tip="The coils only align one way — you'll feel them click when seated correctly." />}
              {current.content === "test" && <InstructionStep title="Step 5 of 5: Reassemble & test" description="Screw the back panel on, plug the dryer back in, and run a test cycle with a damp towel for 10 minutes." tip="If the towel is warm and dry, you nailed it!" />}
              {current.content === "verify" && (
                <VerifyScreen onNext={next} onProCall={() => {
                  toast("Passing your repair data to a Master Tech...");
                  onProCall?.();
                }} />
              )}
              {current.content === "done" && <CompletionScreen cartParts={cartParts} onStartOver={onStartOver} onProCall={onProCall} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SOS Button — visible on active repair steps */}
      {prepPhase === null && current.content !== "done" && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSOS(true)}
          className="fixed top-[72px] right-4 z-40 flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 rounded-full px-3 py-2 touch-manipulation"
        >
          <LifeBuoy className="h-4 w-4 text-destructive" />
          <span className="text-xs font-semibold text-destructive">Stuck? Call a Pro</span>
        </motion.button>
      )}

      {/* SOS Bottom Sheet */}
      <AnimatePresence>
        {showSOS && (
          <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSOS(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-2xl p-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <LifeBuoy className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg text-foreground">Don't worry, we've got you.</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 break-words">
              We'll pass your current step and diagnostic data to a Master Tech. They'll jump on video and talk you through this exact step.
            </p>
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setShowSOS(false);
                  onProCall?.();
                }}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base touch-manipulation"
              >
                Video Call Pro — $15
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSOS(false)}
                className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-base touch-manipulation"
              >
                Nevermind, I'll keep trying
              </motion.button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav — only for repair steps */}
  {prepPhase === null && current.content !== "done" && current.content !== "verify" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(2rem,env(safe-area-inset-bottom))] bg-card/90 backdrop-blur-md flex gap-3">
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

/* =================== CONTINUITY TEST INLINE =================== */

const ContinuityTestInline = ({
  parts,
  failedParts,
  onToggle,
  isGas,
}: {
  parts: typeof ELECTRIC_PARTS;
  failedParts: Set<string>;
  onToggle: (id: string) => void;
  isGas: boolean;
}) => (
  <div>
    <h2 className="font-heading text-xl sm:text-2xl text-foreground mb-2 break-words">
      Test before you replace.
    </h2>
    <p className="text-muted-foreground text-sm mb-6 break-words">
      The panel is open.{" "}
      {isGas
        ? "Set your multimeter to Ohms (Ω). Check resistance on each part — see spec below."
        : "Set your multimeter to continuity mode (🔊). Touch both leads to each part. No beep = bad."}
      {" "}Tap to mark what failed.
    </p>

    <div className="space-y-3 mb-6">
      {parts.map((part) => {
        const failed = failedParts.has(part.id);
        return (
          <motion.button
            key={part.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onToggle(part.id)}
            className={`w-full min-h-[72px] rounded-2xl p-4 flex items-center gap-4 border-2 transition-colors touch-manipulation ${
              failed
                ? "border-destructive bg-destructive/10"
                : "border-border bg-card"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              failed ? "bg-destructive/20" : "bg-muted"
            }`}>
              {failed ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </motion.div>
              ) : (
                <Zap className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="text-foreground font-medium text-base block">{part.testLabel}</span>
              <span className="text-xs text-muted-foreground break-words">{part.testHint}</span>
            </div>
            {failed && (
              <span className="text-xs font-semibold text-destructive bg-destructive/10 rounded-full px-2 py-0.5 flex-shrink-0">
                Failed
              </span>
            )}
          </motion.button>
        );
      })}
    </div>

    <div className="rounded-xl bg-muted/50 border border-border/50 p-3">
      <div className="flex gap-2">
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground break-words">
          Already ordered the thermal fuse? It's fine to replace it regardless — it's the most likely culprit.
        </p>
      </div>
    </div>
  </div>
);

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
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(2rem,env(safe-area-inset-bottom))] bg-card/90 backdrop-blur-md flex gap-3">
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
  cartParts,
  missingTools,
  total,
  onOrder,
  onBack,
}: {
  cartParts: { id: string; label: string; price: number }[];
  missingTools: typeof TOOLS;
  total: number;
  onOrder: () => void;
  onBack: () => void;
}) => {
  const [ordered, setOrdered] = useState(false);

  if (ordered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mb-5"
        >
          <Check className="h-8 w-8 text-success" />
        </motion.div>
        <h2 className="font-heading text-2xl text-foreground mb-2">
          Order placed! 🎉
        </h2>
        <p className="text-muted-foreground text-sm mb-1">
          Arriving tomorrow with Prime.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          Come back when your parts arrive.
        </p>
        {/* What was ordered */}
        <div className="w-full max-w-xs rounded-2xl bg-muted/50 border border-border/50 p-4 mb-8 text-left space-y-2">
          {cartParts.map((p) => (
            <div key={p.id} className="flex justify-between items-center text-sm">
              <span className="text-foreground break-words mr-2">{p.label}</span>
              <span className="text-success font-semibold flex-shrink-0">${p.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onOrder}
          className="w-full max-w-xs h-14 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-lg shadow-accent/20 touch-manipulation"
        >
          Start the Repair Guide
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-2 break-words">Let's get what you're missing.</h2>
      <p className="text-muted-foreground mb-6">Everything ships with Prime.</p>

      <div className="glass-card rounded-2xl p-5 space-y-4 mb-32">
        {/* Dynamic parts from test results */}
        {cartParts.map((p) => (
          <CartItem key={p.id} label={p.label} price={`$${p.price.toFixed(2)}`} required />
        ))}

        {/* Conditional missing tools */}
        {missingTools.map((t) => (
          <CartItem key={t.id} label={t.label} price={`$${t.price.toFixed(2)}`} />
        ))}

        {missingTools.length === 0 && (
          <p className="text-sm text-success font-medium">✓ You have all the tools you need!</p>
        )}
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(2rem,env(safe-area-inset-bottom))] bg-card/90 backdrop-blur-md">
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
            onClick={() => setOrdered(true)}
            className="flex-1 h-14 rounded-xl bg-foreground text-background font-semibold text-base touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Order with Amazon Prime
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const CartItem = ({ label, price, required }: { label: string; price: string; required?: boolean }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        {required ? <ShoppingCart className="h-4 w-4 text-muted-foreground" /> : <Wrench className="h-4 w-4 text-muted-foreground" />}
      </div>
      <span className="text-foreground text-sm font-medium break-words">{label}</span>
    </div>
    <span className="text-accent font-bold flex-shrink-0 ml-2">{price}</span>
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

/* =================== REPAIR SCREENS =================== */

const InstructionStep = ({ title, description, tip }: { title: string; description: string; tip: string }) => (
  <div>
    <h2 className="font-heading text-xl sm:text-2xl text-foreground mb-4 break-words">{title}</h2>
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
    <p className="text-foreground text-sm sm:text-base leading-relaxed mb-4 break-words">{description}</p>
    <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
      <p className="text-sm text-foreground"><span className="font-semibold">💡 Tip:</span> {tip}</p>
    </div>
  </div>
);

const VerifyScreen = ({ onNext, onProCall }: { onNext: () => void; onProCall: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
  >
    <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-2">Run a test cycle now.</h2>
    <p className="text-muted-foreground mb-8 break-words max-w-sm">
      Start your dryer with a damp towel and let it run for 5 minutes. Is it heating up?
    </p>
    <div className="w-full max-w-sm space-y-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full h-16 rounded-2xl bg-success text-success-foreground font-semibold text-base touch-manipulation flex items-center justify-center gap-2"
      >
        ✅ Yes! It's heating!
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onProCall}
        className="w-full h-16 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive font-semibold text-base touch-manipulation flex items-center justify-center gap-2"
      >
        ❌ Still not heating
      </motion.button>
    </div>
  </motion.div>
);

const CompletionScreen = ({ cartParts, onStartOver, onProCall }: { cartParts: { price: number }[]; onStartOver: () => void; onProCall?: () => void }) => {
  const partsTotal = cartParts.reduce((s, p) => s + p.price, 0);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I just fixed my dryer with HomeOS!',
          text: 'Saved $185 in 15 minutes.',
          url: 'https://homeos.app',
        });
      } catch {}
    } else {
      toast("Link copied to clipboard!");
    }
  };

  return (
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
      <p className="text-sm text-muted-foreground mb-4">
        Total cost: ${partsTotal.toFixed(2)} for parts + 15 minutes of your time.
      </p>

      {/* Reassembly safety warning */}
      <div className="rounded-xl bg-warning/10 border border-warning/30 p-4 mb-6 max-w-xs text-left">
        <div className="flex gap-2">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground break-words">
            <span className="font-semibold">Important:</span> Plug it in and test it BEFORE you push the heavy machine back against the wall!
          </p>
        </div>
      </div>

      <button
        onClick={onStartOver}
        className="w-full max-w-xs h-14 rounded-xl bg-primary text-primary-foreground font-semibold touch-manipulation active:scale-[0.98] transition-transform mb-3"
      >
        Fix another appliance
      </button>

      <div className="w-full max-w-xs">
        <p className="text-xs text-muted-foreground mb-2">💬 Know someone with the same problem?</p>
        <button
          onClick={handleShare}
          className="w-full h-14 rounded-xl bg-muted text-foreground font-semibold text-sm touch-manipulation active:scale-[0.98] transition-transform"
        >
          Share this fix
        </button>
      </div>
    </motion.div>
  );
};

export default GuidedFixMode;
