import { useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper, RotateCcw } from "lucide-react";

const FixedCelebration = ({ onStartOver }: { onStartOver: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center min-h-[calc(100dvh-60px)] text-center px-6 pt-12 pb-8 overflow-y-auto"
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

    {/* AWS 10,000 AIdeas share card */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="w-full max-w-sm rounded-2xl bg-accent/10 border border-accent/30 px-5 py-4 flex flex-col gap-3 mb-8 text-left"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">
          🏆 Built for the AWS 10,000 AIdeas Challenge
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          HomeOS is competing for the future of AI-powered home repair.
          If this saved you a $200 service call — help us win by
          giving us a like on AWS Builder Center. Takes 10 seconds.
        </p>
      </div>

      <a
        href="https://builder.aws.com/connect/events/10000aideas"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-semibold text-sm flex items-center justify-center gap-2 touch-manipulation"
        >
          <span>👍</span>
          <span>Like HomeOS on AWS Builder Center</span>
        </motion.button>
      </a>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={async () => {
          const shareData = {
            title: "HomeOS fixed my dryer in 10 minutes 🔥",
            text: "I just used HomeOS to diagnose and fix my Samsung dryer myself — saved $200 on a repair call. It's an AI repair guide built on Amazon Bedrock. Check it out 👇",
            url: "https://builder.aws.com/connect/events/10000aideas",
          };
          if (navigator.share) {
            try { await navigator.share(shareData); } catch (_) { /* cancelled */ }
          } else {
            await navigator.clipboard.writeText(
              `${shareData.text}\n${shareData.url}`
            );
          }
        }}
        className="w-full h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium flex items-center justify-center gap-2 touch-manipulation"
      >
        <span>🔗</span>
        <span>Share HomeOS with a friend</span>
      </motion.button>

      <p className="text-[10px] text-muted-foreground text-center">
        HomeOS × AWS Bedrock · Seattle, WA 🏠
      </p>
    </motion.div>

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
