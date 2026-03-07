import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Category, CATEGORIES, CONTEXT_QUESTIONS, generateMockDiagnosis, DiagnosticResult, QuickIssue } from "@/lib/diagnostic-data";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CategoryCard from "@/components/CategoryCard";
import QuickIssueChips from "@/components/QuickIssueChips";
import SymptomInput from "@/components/SymptomInput";
import ContextQuestions from "@/components/ContextQuestions";
import AnalyzingSteps from "@/components/AnalyzingSteps";
import DiagnosisResults from "@/components/DiagnosisResults";
import MicroConsult from "@/components/MicroConsult";
import GuidedFixMode from "@/components/GuidedFixMode";

type Step = "home" | "symptom" | "context" | "analyzing" | "results" | "consult" | "guided";

const Index = () => {
  const [step, setStep] = useState<Step>("home");
  const [category, setCategory] = useState<Category | null>(null);
  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast();

  const selectedCategory = CATEGORIES.find((c) => c.id === category);

  const handleCategorySelect = (id: string) => {
    setCategory(id as Category);
    setStep("symptom");
  };

  const handleQuickIssue = (issue: QuickIssue) => {
    setCategory(issue.category);
    setSymptom(issue.symptom);
    setStep("context");
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim().length < 6) return;
    setCategory("plumbing");
    setSymptom(searchValue.trim());
    setStep("symptom");
  };

  const handleSymptomSubmit = (s: string) => {
    setSymptom(s);
    setStep("context");
  };

  const handleContextComplete = async (answers: Record<string, string>) => {
    setStep("analyzing");
    try {
      const { data, error } = await supabase.functions.invoke("diagnose", {
        body: { category, symptom, answers },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult({
        category: category!,
        symptom,
        ...data,
      });
      setStep("results");
    } catch (e: unknown) {
      console.error("Diagnosis error, falling back to local:", e);
      toast({
        title: "Using offline diagnosis",
        description: "AI service unavailable — showing local results instead.",
      });
      const fallback = generateMockDiagnosis(category!, symptom, answers);
      setResult(fallback);
      setStep("results");
    }
  };

  const handleStartOver = () => {
    setCategory(null);
    setSymptom("");
    setResult(null);
    setSearchValue("");
    setStep("home");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={handleStartOver} className="flex items-center gap-2 touch-manipulation">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
            <span className="font-heading text-xl text-foreground">HomeOS</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* HOME */}
          {step === "home" && (
            <motion.div key="home" exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-2xl">
              {/* Greeting */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-2">
                  Something broken at home?
                </h1>
                <p className="text-muted-foreground text-lg">We'll help.</p>
              </motion.div>

              {/* Quick issues — PRIMARY */}
              <section className="mb-8">
                <p className="text-sm text-muted-foreground mb-3 text-center">Common issues</p>
                <QuickIssueChips onSelect={handleQuickIssue} />
              </section>

              {/* Categories — SECONDARY */}
              <section className="mb-6">
                <p className="text-sm text-muted-foreground mb-3 text-center">Or pick a category</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat, i) => (
                    <CategoryCard key={cat.id} category={cat} onSelect={handleCategorySelect} index={i} />
                  ))}
                </div>
              </section>

              {/* Search — TERTIARY */}
              <section className="mb-8">
                <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    placeholder="Describe it (e.g., 'toilet won't stop running')"
                    className="w-full rounded-xl border border-border bg-card pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent touch-manipulation"
                  />
                </div>
              </section>

              {/* Footer link */}
              <div className="text-center">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors touch-manipulation">
                  How does this work?
                </button>
              </div>
            </motion.div>
          )}

          {/* SYMPTOM INPUT */}
          {step === "symptom" && selectedCategory && (
            <motion.div key="symptom" exit={{ opacity: 0 }}>
              <SymptomInput
                category={selectedCategory}
                onSubmit={handleSymptomSubmit}
                onBack={handleStartOver}
                initialSymptom={symptom}
              />
            </motion.div>
          )}

          {/* CONTEXT QUESTIONS */}
          {step === "context" && category && (
            <motion.div key="context" exit={{ opacity: 0 }}>
              <ContextQuestions
                questions={CONTEXT_QUESTIONS[category]}
                symptom={symptom}
                onComplete={handleContextComplete}
                onBack={() => setStep("symptom")}
              />
            </motion.div>
          )}

          {/* ANALYZING */}
          {step === "analyzing" && (
            <AnalyzingSteps key="analyzing" onComplete={() => {}} />
          )}

          {/* RESULTS */}
          {step === "results" && result && (
            <motion.div key="results" exit={{ opacity: 0 }}>
              <DiagnosisResults
                result={result}
                onStartOver={handleStartOver}
                onConsult={() => setStep("consult")}
                onGuidedFix={() => setStep("guided")}
              />
            </motion.div>
          )}

          {/* MICRO-CONSULT */}
          {step === "consult" && category && (
            <motion.div key="consult" exit={{ opacity: 0 }}>
              <MicroConsult
                category={category}
                onBack={() => setStep("results")}
              />
            </motion.div>
          )}

          {/* GUIDED FIX MODE */}
          {step === "guided" && result && (
            <motion.div key="guided" exit={{ opacity: 0 }}>
              <GuidedFixMode
                result={result}
                onExit={() => setStep("results")}
                onStartOver={handleStartOver}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>For guidance only — always consult a licensed pro for major work.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
