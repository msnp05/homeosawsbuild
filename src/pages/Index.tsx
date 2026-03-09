import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HomeScreen from "@/components/HomeScreen";
import LiveScanner from "@/components/LiveScanner";
import ContextQuestions from "@/components/ContextQuestions";
import AnalyzingSteps from "@/components/AnalyzingSteps";
import DiagnosisResults from "@/components/DiagnosisResults";
import GuidedFixMode from "@/components/GuidedFixMode";
import ProVideoCall from "@/components/ProVideoCall";
import FixedCelebration from "@/components/FixedCelebration";

type Step = "home" | "scanner" | "context" | "analyzing" | "results" | "guided" | "pro" | "fixed";

const DRYER_QUESTIONS = [
  {
    id: "breaker",
    question: "First — is your dryer plugged in and did you check your circuit breaker?",
    type: "select" as const,
    options: ["Yes, breaker looks fine", "Actually, let me check..."],
  },
  {
    id: "breaker_result",
    question: "Did resetting the breaker fix your dryer?",
    type: "select" as const,
    options: ["Yes, it's working now!", "No, still not heating"],
    condition: { id: "breaker", value: "Actually, let me check..." },
    helperText:
      "💡 On a 240V dryer, the breaker can half-trip — power to the drum but not the heat. Flip the breaker fully OFF then back ON and test again.",
  },
  {
    id: "fuel_type",
    question: "Is your dryer electric or gas?",
    type: "select" as const,
    options: ["Electric (plug has 3-4 prongs)", "Gas (I see a gas line)"],
  },
  {
    id: "vent_cleaning",
    question: "When did you last clean your dryer vent and lint trap?",
    type: "select" as const,
    options: ["Within the last year", "It's been a while", "Never / Not sure"],
  },
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
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({});
  const [isLowConfidence, setIsLowConfidence] = useState(false);

  const handleStartOver = () => {
    setStep("home");
    setSymptomText("");
    setDiagnosticAnswers({});
    setIsLowConfidence(false);
  };

  const HAZARD_KEYWORDS = [
    "burning", "smoke", "sparks", "spark", "bang", "explosion",
    "fire", "flames", "smell gas", "gas smell", "shocked", "shock",
    "arc", "melting", "melted", "scorch", "hot to touch"
  ];

  const handleTextSubmit = (text: string) => {
    setSymptomText(text);
    const lower = text.toLowerCase();
    const isHazard = HAZARD_KEYWORDS.some((kw) => lower.includes(kw));
    if (isHazard) {
      setIsLowConfidence(true);
    }
    setStep("context");
  };

  const handleContextComplete = (answers: Record<string, string>) => {
    setDiagnosticAnswers(answers);
    if (answers.breaker_result === "Yes, it's working now!") {
      setStep("fixed");
      return;
    }
    const isGrinding = answers.spinning === "It makes a weird grinding noise";
    const isDead = answers.spinning === "No, it's completely dead";
    if (isGrinding || isDead) {
      setIsLowConfidence(true);
    }
    setStep("analyzing");
  };

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden max-w-full">
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
          <HomeScreen key="home" onScan={() => setStep("scanner")} onTextSubmit={handleTextSubmit} />
        )}
        {step === "scanner" && (
          <LiveScanner key="scanner" onAnalyze={() => setStep("context")} onBack={handleStartOver} onFixed={() => setStep("fixed")} />
        )}
        {step === "context" && (
          <ContextQuestions
            key="context"
            questions={DRYER_QUESTIONS}
            symptom={symptomText}
            onComplete={handleContextComplete}
            onBack={() => setStep("home")}
          />
        )}
        {step === "fixed" && (
          <FixedCelebration key="fixed" onStartOver={handleStartOver} />
        )}
        {step === "analyzing" && (
          <AnalyzingSteps key="analyzing" onComplete={() => setStep("results")} />
        )}
        {step === "results" && (
          <DiagnosisResults
            key="results"
            answers={diagnosticAnswers}
            onGuidedFix={() => setStep("guided")}
            onProCall={() => setStep("pro")}
            onStartOver={handleStartOver}
            isLowConfidence={isLowConfidence}
          />
        )}
        {step === "guided" && (
          <GuidedFixMode
            key="guided"
            answers={diagnosticAnswers}
            onBack={() => setStep("results")}
            onStartOver={handleStartOver}
            onProCall={() => setStep("pro")}
          />
        )}
        {step === "pro" && (
          <ProVideoCall key="pro" onBack={() => setStep("results")} onStartOver={handleStartOver} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
