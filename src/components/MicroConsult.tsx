import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Clock, Star, ArrowLeft, Check, CreditCard, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MicroConsultProps {
  category: string;
  onBack: () => void;
}

const MOCK_PROS = [
  { id: 1, name: "Mike Reynolds", rating: 4.9, reviews: 127, specialty: "Appliances & Plumbing", available: "Today, 2:00 PM", avatar: "MR" },
  { id: 2, name: "Sarah Chen", rating: 4.8, reviews: 89, specialty: "HVAC & Electrical", available: "Today, 4:30 PM", avatar: "SC" },
  { id: 3, name: "James Park", rating: 4.7, reviews: 203, specialty: "All Categories", available: "Tomorrow, 9:00 AM", avatar: "JP" },
];

const MicroConsult = ({ category, onBack }: MicroConsultProps) => {
  const [step, setStep] = useState<"book" | "booked">("book");
  const [showOthers, setShowOthers] = useState(false);
  const [selectedPro, setSelectedPro] = useState(MOCK_PROS[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation">
        <ArrowLeft className="h-4 w-4" /> Back to results
      </button>

      {step === "book" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-foreground">Quick video consult</h2>
              <p className="text-sm text-muted-foreground">~15 min with a local {category} pro</p>
            </div>
          </div>

          {/* Selected pro + book card */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {selectedPro.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-lg">{selectedPro.name}</p>
                <p className="text-xs text-muted-foreground">{selectedPro.specialty}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <Star className="h-3 w-3 fill-current" /> {selectedPro.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedPro.reviews} reviews</span>
                  <span className="flex items-center gap-1 text-xs text-success">
                    <Clock className="h-3 w-3" /> {selectedPro.available}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 mb-4 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Video consult · ~15 min</span>
              <span className="text-foreground font-bold text-lg">$18</span>
            </div>

            <Button onClick={() => setStep("booked")} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 min-h-[52px] text-base touch-manipulation">
              <CreditCard className="h-4 w-4 mr-2" /> Book for $18
            </Button>

            <button
              onClick={() => setShowOthers(!showOthers)}
              className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation flex items-center justify-center gap-1"
            >
              See other pros <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showOthers ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Other pros */}
          {showOthers && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              {MOCK_PROS.filter(p => p.id !== selectedPro.id).map((pro) => (
                <button
                  key={pro.id}
                  onClick={() => { setSelectedPro(pro); setShowOthers(false); }}
                  className="w-full glass-card rounded-xl p-4 text-left transition-all hover:border-accent/30 touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {pro.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{pro.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-accent flex items-center gap-0.5"><Star className="h-3 w-3 fill-current" /> {pro.rating}</span>
                        <span>·</span>
                        <span className="text-success">{pro.available}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {step === "booked" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-8 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="font-heading text-2xl text-foreground mb-2">You're all set!</h3>
          <p className="text-muted-foreground mb-1">
            Your session with <strong>{selectedPro.name}</strong>
          </p>
          <p className="text-foreground font-medium mb-4">{selectedPro.available}</p>
          <p className="text-sm text-muted-foreground mb-6">
            You'll get a link to join. Have your device near the issue.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" className="gap-2 min-h-[48px] touch-manipulation">
              <Calendar className="h-4 w-4" /> Add to calendar
            </Button>
            <Button onClick={onBack} variant="outline" className="min-h-[48px] touch-manipulation">
              Back to diagnosis
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MicroConsult;
