import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HomeScreen from "@/components/HomeScreen";
import LiveScanner from "@/components/LiveScanner";
import ContextQuestions from "@/components/ContextQuestions";
import AnalyzingSteps from "@/components/AnalyzingSteps";
import DiagnosisResults from "@/components/DiagnosisResults";
import GuidedFixMode from "@/components/GuidedFixMode";
import ProVideoCall from "@/components/ProVideoCall";

type Step = "home" | "scanner" | "context" | "analyzing" | "results" | "guided" | "pro";

const DRYER_QUESTIONS = [
  {
    id: "brand",
    question: "What brand is your dryer?",
    type: "select" as const,
    options: ["Samsung", "LG", "Whirlpool", "Not sure"],
  },
  {
    id: "spinning",
    question: "Is the drum still spinning when you turn it on?",
    type: "select" as const,
    options: [
      "Yes, it spins but no heat",
      "No, it's completely dead",
      "It makes a weird grinding noise",
    ],
  },
];

const Index = () => {
  const [step, setStep] = useState<Step>("home");
  const [symptomText, setSymptomText] = useState("");

  const handleStartOver = () => {
    setStep("home");
    setSymptomText("");
  };

  const handleTextSubmit = (text: string) => {
    setSymptomText(text);
    setStep("context");
  };

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden max-w-full">
      {/* Minimal header */}
      {step !== "scanner" && step !== "pro" && (
        <header className="sticky top-0 z-50 bg-card/60 backdrop-blur-xl border-b border-border/30">
          <div className="container mx-auto flex items-center px-4 py-3">
            <button onClick={handleStartOver} className="flex items-center gap-2 touch-manipulation">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">H</span>
              </div>
              <span className="font-heading text-xl text-foreground">HomeOS</span>
            </button>
          </div>
        </header>
      )}

      <AnimatePresence mode="wait">
        {step === "home" && (
          <HomeScreen
            key="home"
            onScan={() => setStep("scanner")}
            onTextSubmit={handleTextSubmit}
          />
        )}
        {step === "scanner" && (
          <LiveScanner
            key="scanner"
            onAnalyze={() => setStep("analyzing")}
            onBack={handleStartOver}
          />
        )}
        {step === "context" && (
          <ContextQuestions
            key="context"
            questions={DRYER_QUESTIONS}
            symptom={symptomText}
            onComplete={() => setStep("analyzing")}
            onBack={() => setStep("home")}
          />
        )}
        {step === "analyzing" && (
          <AnalyzingSteps
            key="analyzing"
            onComplete={() => setStep("results")}
          />
        )}
        {step === "results" && (
          <DiagnosisResults
            key="results"
            onGuidedFix={() => setStep("guided")}
            onProCall={() => setStep("pro")}
            onStartOver={handleStartOver}
          />
        )}
        {step === "guided" && (
          <GuidedFixMode
            key="guided"
            onBack={() => setStep("results")}
            onStartOver={handleStartOver}
          />
        )}
        {step === "pro" && (
          <ProVideoCall
            key="pro"
            onBack={() => setStep("results")}
            onStartOver={handleStartOver}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
