import { Droplets, Zap, Wind, Wrench, LucideIcon } from "lucide-react";

export type Category = "plumbing" | "electrical" | "hvac" | "appliances";

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: LucideIcon;
  description: string;
  examples: string[];
}

export interface QuickIssue {
  label: string;
  category: Category;
  symptom: string;
}

export const QUICK_ISSUES: QuickIssue[] = [
  { label: "Leaking faucet", category: "plumbing", symptom: "My faucet is dripping and won't stop" },
  { label: "Toilet running", category: "plumbing", symptom: "My toilet keeps running after flushing" },
  { label: "No hot water", category: "plumbing", symptom: "I have no hot water in my home" },
  { label: "AC not cooling", category: "hvac", symptom: "My AC is running but blowing warm air" },
  { label: "Dryer not heating", category: "appliances", symptom: "My dryer runs but clothes stay wet" },
  { label: "Tripped breaker", category: "electrical", symptom: "A circuit breaker tripped and won't reset" },
];

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "plumbing",
    label: "Plumbing",
    icon: Droplets,
    description: "Leaks, clogs, water pressure, and pipe issues",
    examples: ["Dripping faucet", "Clogged drain", "Low water pressure", "Running toilet"],
  },
  {
    id: "electrical",
    label: "Electrical",
    icon: Zap,
    description: "Outlets, circuits, switches, and wiring concerns",
    examples: ["Flickering lights", "Tripped breaker", "Dead outlet", "Buzzing sounds"],
  },
  {
    id: "hvac",
    label: "HVAC",
    icon: Wind,
    description: "Heating, cooling, ventilation, and air quality",
    examples: ["AC not cooling", "Furnace won't start", "Strange odors", "Uneven heating"],
  },
  {
    id: "appliances",
    label: "Appliances",
    icon: Wrench,
    description: "Washers, dryers, dishwashers, and more",
    examples: ["Washer won't drain", "Dryer not heating", "Dishwasher leaking", "Fridge too warm"],
  },
];

export interface BinaryAnswer {
  question: string;
  answer: boolean | null;
}

export interface DiagnosticResult {
  category: Category;
  symptom: string;
  causes: { name: string; probability: number; explanation: string }[];
  confidenceScore: number;
  safetyLevel: "safe" | "caution" | "danger";
  safetyNote: string;
  costEstimate: { low: number; high: number; unit: string };
  nextSteps: {
    type: "diy" | "monitor" | "professional";
    label: string;
    description: string;
    time?: string;
    difficulty?: "Easy" | "Medium" | "Hard";
    estimatedMinutes: number;
    difficultyLevel: "beginner" | "intermediate" | "advanced";
  }[];
  socialProof?: { count: number; avgMinutes: number };
}

export interface ContextQuestion {
  id: string;
  question: string;
  type: "select" | "text";
  options?: string[];
  condition?: { id: string; value: string };
  helperText?: string;
}

export const BINARY_QUESTIONS: Record<Category, { id: string; question: string }[]> = {
  plumbing: [
    { id: "leaking", question: "Is it leaking?" },
    { id: "noise", question: "Is it making a noise?" },
    { id: "sudden", question: "Did it stop working suddenly?" },
  ],
  electrical: [
    { id: "tripping", question: "Is a breaker tripping?" },
    { id: "flickering", question: "Are lights flickering?" },
    { id: "sudden", question: "Did it happen suddenly?" },
  ],
  hvac: [
    { id: "running", question: "Is the system running?" },
    { id: "noise", question: "Is it making unusual noises?" },
    { id: "sudden", question: "Did it stop working suddenly?" },
  ],
  appliances: [
    { id: "powers_on", question: "Does it turn on?" },
    { id: "noise", question: "Is it making a noise?" },
    { id: "sudden", question: "Did it stop working suddenly?" },
  ],
};

export const CONTEXT_QUESTIONS: Record<Category, ContextQuestion[]> = {
  plumbing: [
    { id: "location", question: "Where is the issue?", type: "select", options: ["Kitchen", "Bathroom", "Basement", "Outdoor"] },
    { id: "duration", question: "How long has this been going on?", type: "select", options: ["Just started", "A few days", "A week+", "Months"] },
    { id: "severity", question: "How bad is it?", type: "select", options: ["Minor annoyance", "Moderate", "Significant", "Emergency"] },
  ],
  electrical: [
    { id: "location", question: "Which area of your home?", type: "select", options: ["Living room", "Kitchen", "Bedroom", "Whole house"] },
    { id: "when", question: "When does it happen?", type: "select", options: ["Always", "On and off", "During storms", "Using appliances"] },
    { id: "age", question: "How old is your home's wiring?", type: "select", options: ["< 10 years", "10–25 years", "25–50 years", "50+ years", "No idea"] },
  ],
  hvac: [
    { id: "system", question: "What type of system?", type: "select", options: ["Central AC", "Heat pump", "Furnace", "Window unit", "Mini-split"] },
    { id: "lastService", question: "Last time it was serviced?", type: "select", options: ["< 6 months", "6–12 months", "1–2 years", "2+ years", "No idea"] },
    { id: "thermostat", question: "Is your thermostat working?", type: "select", options: ["Yes, normally", "Partially", "Not at all", "Shows error"] },
  ],
  appliances: [
    { id: "appliance", question: "Which appliance?", type: "select", options: ["Washing machine", "Dryer", "Dishwasher", "Refrigerator", "Oven/Range", "Other"] },
    { id: "age", question: "How old is it?", type: "select", options: ["< 2 years", "2–5 years", "5–10 years", "10+ years"] },
    { id: "noise", question: "Any unusual sounds?", type: "select", options: ["No sounds", "Grinding", "Buzzing", "Clicking", "Rattling"] },
  ],
};

export function generateMockDiagnosis(category: Category, symptom: string, _answers: Record<string, string>): DiagnosticResult {
  const mockResults: Record<Category, DiagnosticResult> = {
    plumbing: {
      category: "plumbing",
      symptom,
      causes: [
        { name: "Worn washer or O-ring", probability: 72, explanation: "Over time, the rubber components inside faucets degrade, causing drips." },
        { name: "Corroded valve seat", probability: 18, explanation: "Mineral deposits can corrode the valve seat, leading to leaks around the spout." },
        { name: "Loose packing nut", probability: 10, explanation: "The packing nut near the stem may have loosened over time." },
      ],
      confidenceScore: 82,
      safetyLevel: "safe",
      safetyNote: "This is safe to investigate yourself. Just turn off the water supply first.",
      costEstimate: { low: 5, high: 50, unit: "DIY parts" },
      nextSteps: [
        { type: "diy", label: "Turn off the water supply", description: "Find the shut-off valve under the sink and turn it clockwise until fully closed.", time: "~2 min", difficulty: "Easy", estimatedMinutes: 2, difficultyLevel: "beginner" },
        { type: "diy", label: "Remove the faucet handle", description: "Pop off the decorative cap, unscrew the handle screw, and pull the handle off.", time: "~5 min", difficulty: "Easy", estimatedMinutes: 5, difficultyLevel: "beginner" },
        { type: "diy", label: "Replace the washer", description: "Remove the old rubber washer from the stem and press in the replacement.", time: "~5 min", difficulty: "Easy", estimatedMinutes: 5, difficultyLevel: "beginner" },
        { type: "diy", label: "Reassemble and test", description: "Put the handle back on, tighten the screw, turn on the water, and check for drips.", time: "~3 min", difficulty: "Easy", estimatedMinutes: 3, difficultyLevel: "beginner" },
      ],
      socialProof: { count: 412, avgMinutes: 18 },
    },
    electrical: {
      category: "electrical",
      symptom,
      causes: [
        { name: "Overloaded circuit", probability: 45, explanation: "Too many devices on one circuit can cause the breaker to trip." },
        { name: "Faulty switch or dimmer", probability: 30, explanation: "Worn switch contacts can cause intermittent connections." },
        { name: "Loose wiring connection", probability: 25, explanation: "Loose wire connections at the fixture or outlet can cause issues." },
      ],
      confidenceScore: 68,
      safetyLevel: "caution",
      safetyNote: "Don't open panels or touch exposed wiring. Safety first.",
      costEstimate: { low: 0, high: 200, unit: "depending on cause" },
      nextSteps: [
        { type: "professional", label: "Hire an electrician", description: "Recommended for circuit or wiring concerns. Don't attempt panel work yourself.", time: "1–3 hrs", difficulty: "Hard", estimatedMinutes: 120, difficultyLevel: "advanced" },
        { type: "diy", label: "Check bulb connections", description: "Safely tighten bulbs and ensure they're the correct wattage.", time: "~5 min", difficulty: "Easy", estimatedMinutes: 5, difficultyLevel: "beginner" },
        { type: "monitor", label: "Note when it happens", description: "Keep a log of when the issue occurs and what appliances are running.", time: "A few days", difficulty: "Easy", estimatedMinutes: 10, difficultyLevel: "beginner" },
      ],
      socialProof: { count: 89, avgMinutes: 15 },
    },
    hvac: {
      category: "hvac",
      symptom,
      causes: [
        { name: "Dirty air filter", probability: 55, explanation: "A clogged filter restricts airflow and reduces system efficiency significantly." },
        { name: "Low refrigerant", probability: 25, explanation: "Refrigerant leaks reduce cooling capacity. Requires professional recharge." },
        { name: "Faulty thermostat", probability: 20, explanation: "The thermostat may not be reading temperature correctly or sending proper signals." },
      ],
      confidenceScore: 75,
      safetyLevel: "safe",
      safetyNote: "Filter replacement is safe. Refrigerant handling requires a licensed technician.",
      costEstimate: { low: 10, high: 400, unit: "depending on cause" },
      nextSteps: [
        { type: "diy", label: "Find your air filter", description: "Locate the return air vent — usually on a wall or ceiling. The filter slides out from behind the cover.", time: "~2 min", difficulty: "Easy", estimatedMinutes: 2, difficultyLevel: "beginner" },
        { type: "diy", label: "Check the filter condition", description: "Hold it up to light. If you can't see through it, it needs replacing. Note the size printed on the edge.", time: "~1 min", difficulty: "Easy", estimatedMinutes: 1, difficultyLevel: "beginner" },
        { type: "diy", label: "Install new filter", description: "Slide the new filter in with the arrow pointing toward the duct. Close the vent cover.", time: "~2 min", difficulty: "Easy", estimatedMinutes: 2, difficultyLevel: "beginner" },
        { type: "monitor", label: "Check thermostat readings", description: "Compare thermostat temp with a separate thermometer for accuracy.", time: "~5 min", difficulty: "Easy", estimatedMinutes: 5, difficultyLevel: "beginner" },
      ],
      socialProof: { count: 287, avgMinutes: 12 },
    },
    appliances: {
      category: "appliances",
      symptom,
      causes: [
        { name: "Clogged lint filter or vent", probability: 50, explanation: "Debris blocks airflow, preventing the dryer from heating properly." },
        { name: "Faulty heating element", probability: 30, explanation: "The heating element may have burned out and needs replacement." },
        { name: "Broken thermal fuse", probability: 20, explanation: "A blown thermal fuse cuts power to the heating system as a safety measure." },
      ],
      confidenceScore: 58,
      safetyLevel: "caution",
      safetyNote: "Unplug the appliance before any inspection. There may be standing water.",
      costEstimate: { low: 15, high: 300, unit: "parts + labor" },
      nextSteps: [
        { type: "professional", label: "Book a repair technician", description: "A qualified appliance technician can diagnose and fix the issue safely.", time: "1–2 hrs", difficulty: "Hard", estimatedMinutes: 90, difficultyLevel: "advanced" },
        { type: "diy", label: "Clean the lint filter", description: "Remove and clean the lint trap. Check the exhaust vent for blockages.", time: "~10 min", difficulty: "Easy", estimatedMinutes: 10, difficultyLevel: "beginner" },
        { type: "monitor", label: "Run a test cycle", description: "After cleaning, run a short cycle and check if clothes come out warm.", time: "~30 min", difficulty: "Easy", estimatedMinutes: 30, difficultyLevel: "beginner" },
      ],
      socialProof: { count: 156, avgMinutes: 25 },
    },
  };

  return mockResults[category];
}
