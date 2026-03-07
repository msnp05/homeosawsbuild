import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Camera, AlertTriangle, ArrowLeft, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CategoryInfo, BINARY_QUESTIONS } from "@/lib/diagnostic-data";

interface SymptomInputProps {
  category: CategoryInfo;
  onSubmit: (symptom: string, photo?: string | null, binaryAnswers?: Record<string, boolean>) => void;
  onBack: () => void;
  initialSymptom?: string;
}

const EMERGENCY_KEYWORDS = [
  "gas leak", "gas smell", "smell gas", "carbon monoxide", "co detector",
  "on fire", "electrical fire", "fire", "flooding", "flood",
  "burst pipe", "water everywhere", "ceiling collapsed", "structural",
  "sparks", "electrocution", "smoke", "collapse", "collapsed",
];

const CAUTION_KEYWORDS = [
  "gas line", "main panel", "breaker box", "200 amp", "refrigerant",
  "freon", "load bearing", "load-bearing", "asbestos", "septic",
  "220v", "240v", "electrical panel", "breaker panel",
  "foundation crack",
];

type SafetyTier = "safe" | "caution" | "emergency";

function detectSafety(text: string): SafetyTier {
  const lower = text.toLowerCase();
  if (EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw))) return "emergency";
  if (CAUTION_KEYWORDS.some((kw) => lower.includes(kw))) return "caution";
  return "safe";
}

const SymptomInput = ({ category, onSubmit, onBack, initialSymptom = "" }: SymptomInputProps) => {
  const binaryQs = BINARY_QUESTIONS[category.id] || [];
  const [binaryAnswers, setBinaryAnswers] = useState<Record<string, boolean>>({});
  const [optionalText, setOptionalText] = useState(initialSymptom);
  const [safetyTier, setSafetyTier] = useState<SafetyTier>(detectSafety(initialSymptom));
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const Icon = category.icon;

  const hasBinaryAnswer = Object.keys(binaryAnswers).length > 0;
  const hasEnoughText = optionalText.trim().length >= 10;
  const canSubmit = (hasBinaryAnswer || hasEnoughText || photo !== null) &&
    !(safetyTier === "emergency" && !emergencyDismissed);

  const handleTextChange = (value: string) => {
    setOptionalText(value);
    const tier = detectSafety(value);
    setSafetyTier(tier);
    if (tier === "emergency") setEmergencyDismissed(false);
  };

  const handleBinaryToggle = (id: string, value: boolean) => {
    setBinaryAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    // Build symptom string from binary answers + optional text
    const parts: string[] = [];
    binaryQs.forEach((q) => {
      if (binaryAnswers[q.id] === true) {
        parts.push(q.question.replace("?", "").replace("Is it ", "").replace("Did it ", "").replace("Does it ", "").replace("Are ", "").toLowerCase());
      }
    });
    const symptomText = optionalText.trim() || parts.join(", ") || category.label + " issue";
    onSubmit(symptomText, photo, binaryAnswers);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Photo is too large, please try a smaller image");
      return;
    }
    const url = URL.createObjectURL(file);
    setPhoto(url);
  };

  const removePhoto = () => {
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* Emergency full-screen overlay */}
      <AnimatePresence>
        {safetyTier === "emergency" && !emergencyDismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-danger/95 p-6"
          >
            <div className="max-w-sm text-center">
              <AlertTriangle className="h-16 w-16 text-danger-foreground mx-auto mb-6" />
              <h2 className="font-heading text-3xl text-danger-foreground mb-3">Call 911 Now</h2>
              <p className="text-danger-foreground/90 text-lg mb-8">
                This sounds like an emergency. Leave the area and call 911 or your utility provider. HomeOS can't help with active emergencies.
              </p>
              <Button
                onClick={() => setEmergencyDismissed(true)}
                variant="outline"
                className="min-h-[52px] text-base px-8 bg-transparent border-danger-foreground/50 text-danger-foreground hover:bg-danger-foreground/10 touch-manipulation"
              >
                I'm safe — continue
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl pb-24 sm:pb-0"
      >
        <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] touch-manipulation">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-foreground">Tell us what's happening</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5 ml-[52px]">Tap what applies — we'll figure out the rest</p>

        {/* Caution banner */}
        {safetyTier === "caution" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-4 flex gap-3"
          >
            <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">⚠️ Heads up — this usually needs a licensed pro</p>
              <p className="text-sm text-muted-foreground mt-1">
                We can help you understand what's going on, but don't attempt this repair yourself.
              </p>
            </div>
          </motion.div>
        )}

        <div className="glass-card rounded-xl p-5 sm:p-6 space-y-5">
          {/* Binary questions */}
          <div className="space-y-3">
            {binaryQs.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-4">
                <span className="text-base text-foreground">{q.question}</span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleBinaryToggle(q.id, true)}
                    className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all min-h-[48px] touch-manipulation ${
                      binaryAnswers[q.id] === true
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-foreground hover:border-accent/50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleBinaryToggle(q.id, false)}
                    className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all min-h-[48px] touch-manipulation ${
                      binaryAnswers[q.id] === false
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-foreground hover:border-accent/50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Optional text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Anything else? <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={optionalText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="One sentence is enough…"
              className="min-h-[72px] resize-none text-base bg-background"
              rows={2}
            />
          </div>

          {/* Photo upload */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer touch-manipulation min-h-[48px]"
            >
              <Camera className="h-5 w-5" />
              Add a photo
              <input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handlePhotoUpload}
              />
            </label>

            {photo && (
              <div className="relative">
                <img src={photo} alt="Uploaded" className="h-16 w-16 rounded-lg object-cover border border-border" />
                <button
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-danger text-danger-foreground flex items-center justify-center touch-manipulation"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {photoError && (
            <p className="text-sm text-danger">{photoError}</p>
          )}

          {/* Desktop submit */}
          <div className="hidden sm:flex items-center justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-accent text-accent-foreground hover:bg-accent/90 min-h-[56px] px-8 text-base rounded-xl"
            >
              <Send className="h-4 w-4 mr-2" />
              Get my diagnosis
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          For guidance only — always consult a licensed pro for major work.
        </p>
      </motion.div>

      {/* Sticky submit bar on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md p-3 sm:hidden">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 min-h-[56px] text-base rounded-xl"
        >
          <Send className="h-4 w-4 mr-2" />
          Get my diagnosis
        </Button>
      </div>
    </>
  );
};

export default SymptomInput;
