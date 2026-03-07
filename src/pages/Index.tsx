import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HomeScreen from "@/components/HomeScreen";
import LiveScanner from "@/components/LiveScanner";
import AnalyzingSteps from "@/components/AnalyzingSteps";
import DiagnosisResults from "@/components/DiagnosisResults";
import GuidedFixMode from "@/components/GuidedFixMode";
import ProVideoCall from "@/components/ProVideoCall";

type Step = "home" | "scanner" | "analyzing" | "results" | "guided" | "pro";

const Index = () => {
  const [step, setStep] = useState<Step>("home");

  const handleStartOver = () => setStep("home");

  return (
    <div className="min-h-screen bg-background">
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
          <HomeScreen key="home" onScan={() => setStep("scanner")} />
        )}
        {step === "scanner" && (
          <LiveScanner
            key="scanner"
            onAnalyze={() => setStep("analyzing")}
            onBack={handleStartOver}
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
