import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Mic, MicOff, X } from "lucide-react";
import dryerImage from "@/assets/dryer-viewfinder.jpg";

interface LiveScannerProps {
  onAnalyze: () => void;
  onBack: () => void;
}

const TRANSCRIPT_TEXT = "The drum is spinning but the clothes are completely cold and wet...";

const STATUS_MESSAGES = [
  "Calibrating microphone for background noise...",
  "Listening for motor or belt sounds...",
  "Transcribing your voice...",
];

const LiveScanner = ({ onAnalyze, onBack }: LiveScannerProps) => {
  const [recognized, setRecognized] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [transcriptDone, setTranscriptDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  // Step 1: AR recognition after 1.5s
  useEffect(() => {
    const t = setTimeout(() => setRecognized(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Step 2: Start transcription after recognition
  useEffect(() => {
    if (!recognized) return;
    const t = setTimeout(() => setTranscribing(true), 1200);
    return () => clearTimeout(t);
  }, [recognized]);

  // Step 3: Typewriter effect
  useEffect(() => {
    if (!transcribing || muted) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(TRANSCRIPT_TEXT.slice(0, i));
      if (i >= TRANSCRIPT_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => setTranscriptDone(true), 600);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [transcribing, muted]);

  // System status rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Viewfinder area */}
      <div className="flex-1 relative mx-4 my-2 rounded-2xl overflow-hidden">
        {/* Dryer image */}
        <img
          src={dryerImage}
          alt="Dryer viewfinder"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-foreground/40" />

        {/* Mic Active indicator */}
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
            {muted ? "Mic muted" : "Listening to appliance..."}
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
              {/* Corner markers */}
              <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-3 border-l-3 border-accent rounded-tl-lg" />
              <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-3 border-r-3 border-accent rounded-tr-lg" />
              <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-3 border-l-3 border-accent rounded-bl-lg" />
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-3 border-r-3 border-accent rounded-br-lg" />

              {/* Recognition tooltip */}
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

        {/* System status banner */}
        <div className="absolute bottom-4 left-4 right-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="bg-card/20 backdrop-blur-xl rounded-xl px-4 py-2.5 text-center"
            >
              <p className="text-xs text-primary-foreground/70 font-medium">
                {STATUS_MESSAGES[statusIndex]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Transcription area */}
      <div className="px-4 py-3 min-h-[80px]">
        <AnimatePresence>
          {transcribing && !muted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl px-4 py-3 flex items-start gap-3"
            >
              <div className="mt-1 h-5 w-5 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0">
                <Mic className="h-3 w-3 text-danger" />
              </div>
              <p className="text-foreground text-sm leading-relaxed italic">
                "{displayedText}"
                {!transcriptDone && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-0.5 h-4 bg-foreground ml-0.5 align-middle"
                  />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(2rem,env(safe-area-inset-bottom))] bg-card/90 backdrop-blur-md">
        <div className="flex gap-3">
          {/* Mute toggle */}
          <motion.button
            onClick={() => setMuted((m) => !m)}
            whileTap={{ scale: 0.95 }}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center touch-manipulation transition-colors ${
              muted
                ? "bg-danger/20 border border-danger/30"
                : "bg-card/50 border border-border/30"
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

          {/* Analyze button */}
          <motion.button
            onClick={onAnalyze}
            disabled={!transcriptDone}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: transcriptDone ? 1 : 0.5 }}
            whileTap={transcriptDone ? { scale: 0.97 } : {}}
            className="flex-1 h-14 rounded-2xl bg-accent text-accent-foreground font-semibold text-lg shadow-lg shadow-accent/20 disabled:opacity-40 touch-manipulation transition-all"
          >
            {transcriptDone ? "Analyze Issue" : "Listening..."}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveScanner;
