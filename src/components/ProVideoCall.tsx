import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, ArrowLeft, CheckCircle2, Mic, Video, MessageSquare } from "lucide-react";

interface ProVideoCallProps {
  onBack: () => void;
  onStartOver: () => void;
}

const ProVideoCall = ({ onBack, onStartOver }: ProVideoCallProps) => {
  const [state, setState] = useState<"ringing" | "connected">("ringing");

  useEffect(() => {
    const t = setTimeout(() => setState("connected"), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground flex flex-col h-[100dvh] overflow-hidden"
    >
      {state === "ringing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Avatar */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-28 w-28 rounded-full bg-accent/20 flex items-center justify-center mb-6"
          >
            <div className="h-20 w-20 rounded-full bg-accent/30 flex items-center justify-center">
              <span className="text-3xl font-bold text-accent-foreground">M</span>
            </div>
          </motion.div>

          <h2 className="font-heading text-2xl text-primary-foreground mb-1">Mike</h2>
          <p className="text-primary-foreground/60 text-sm mb-8">Appliance Specialist • 4.9 ★</p>

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-primary-foreground/70 text-base"
          >
            Connecting...
          </motion.p>

          {/* Cancel */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(2rem,env(safe-area-inset-bottom))] flex justify-center">
            <button
              onClick={onBack}
              className="h-16 w-16 rounded-full bg-danger flex items-center justify-center touch-manipulation"
            >
              <PhoneOff className="h-7 w-7 text-danger-foreground" />
            </button>
          </div>
        </div>
      )}

      {state === "connected" && (
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button onClick={onBack} className="h-12 w-12 rounded-full bg-card/10 backdrop-blur-md flex items-center justify-center touch-manipulation">
              <ArrowLeft className="h-5 w-5 text-primary-foreground" />
            </button>
            <div className="text-center">
              <p className="text-primary-foreground text-sm font-medium">Mike — Appliance Specialist</p>
              <p className="text-primary-foreground/50 text-xs">Connected • 0:03</p>
            </div>
            <div className="w-12" />
          </div>

          {/* "Video" area placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-card/10 flex items-center justify-center">
              <span className="text-5xl font-bold text-primary-foreground/30">M</span>
            </div>
          </div>

          {/* Context shared panel */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-4 mb-4 rounded-2xl bg-card/95 backdrop-blur-xl p-5"
          >
            <p className="text-sm font-semibold text-foreground mb-3">Context Shared with Mike</p>
            <div className="space-y-2">
              <ContextItem text="Appliance: Samsung DV42H Dryer" />
              <ContextItem text="Issue: Drum spins but clothes stay cold/wet" />
              <ContextItem text="Hypothesis: Blown Thermal Fuse (78% match)" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Mike already has everything — no repeating yourself.</p>
          </motion.div>

          {/* Call controls */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-foreground/90 backdrop-blur-md">
            <div className="flex items-center justify-center gap-6">
              <button className="h-14 w-14 rounded-full bg-card/15 flex items-center justify-center touch-manipulation">
                <Mic className="h-6 w-6 text-primary-foreground" />
              </button>
              <button className="h-14 w-14 rounded-full bg-card/15 flex items-center justify-center touch-manipulation">
                <Video className="h-6 w-6 text-primary-foreground" />
              </button>
              <button className="h-14 w-14 rounded-full bg-card/15 flex items-center justify-center touch-manipulation">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </button>
              <button
                onClick={onStartOver}
                className="h-14 w-14 rounded-full bg-danger flex items-center justify-center touch-manipulation"
              >
                <PhoneOff className="h-6 w-6 text-danger-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ContextItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
    <span className="text-sm text-foreground">{text}</span>
  </div>
);

export default ProVideoCall;
