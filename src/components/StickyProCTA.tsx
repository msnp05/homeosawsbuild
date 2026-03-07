import { motion } from "framer-motion";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyProCTAProps {
  onConsult: () => void;
  show: boolean;
}

const StickyProCTA = ({ onConsult, show }: StickyProCTAProps) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md p-3 sm:hidden"
    >
      <Button
        onClick={onConsult}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 min-h-[48px] text-base gap-2"
      >
        <Video className="h-5 w-5" />
        Not sure? Video call a pro — $15
      </Button>
    </motion.div>
  );
};

export default StickyProCTA;
