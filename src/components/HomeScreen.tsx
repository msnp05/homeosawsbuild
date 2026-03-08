import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Mic, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HomeScreenProps {
  onScan: () => void;
}

const HomeScreen = ({ onScan }: HomeScreenProps) => {
  const [textInput, setTextInput] = useState("");

  const handleScan = () => {
    toast({
      description: "🔒 Camera & mic are only used to diagnose your issue and are never stored.",
    });
    onScan();
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    handleScan();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-6"
    >
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-center mb-12 max-w-sm"
      >
        <h1 className="font-heading text-4xl sm:text-5xl text-foreground leading-tight mb-3">
          Appliance acting up?
        </h1>
        <p className="text-muted-foreground text-lg">
          Let's figure it out.
        </p>
      </motion.div>

      {/* Hero scan button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
        onClick={handleScan}
        className="relative group touch-manipulation mb-8"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-soft scale-125" />
        <div className="absolute inset-0 rounded-full bg-accent/10 animate-pulse-soft scale-150 animation-delay-500" />

        {/* Button itself */}
        <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-2xl shadow-accent/30 group-active:scale-95 transition-transform duration-150">
          <div className="flex items-center gap-2">
            <Camera className="h-8 w-8 text-accent-foreground" />
            <Mic className="h-6 w-6 text-accent-foreground/80" />
          </div>
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center max-w-xs mb-8"
      >
        <p className="text-foreground font-medium text-lg mb-1">Scan my appliance</p>
        <p className="text-muted-foreground text-sm">
          Point your camera and just tell us what's wrong.
        </p>
      </motion.div>

      {/* Text fallback input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="relative">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            placeholder="Or just type what's wrong (e.g., 'dryer won't heat')..."
            className="w-full h-12 pl-4 pr-12 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center touch-manipulation transition-colors hover:bg-accent/20 disabled:opacity-30"
          >
            <Send className="h-4 w-4 text-accent" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/50 text-center mt-2">
          Perfect for quiet environments 🤫
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-xs text-muted-foreground/60">
          For guidance only — always consult a licensed pro for major work.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HomeScreen;
