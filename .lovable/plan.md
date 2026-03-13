
# HomeOS: Redesign for Speed, Empathy, and One-Handed Use

## The Problem
The current prototype works, but it's built for someone sitting calmly at a desk. Real users are standing in a puddle, holding a flashlight, or bouncing a toddler. Every extra tap, every screen of jargon, every moment of confusion costs trust.

## Design Philosophy
- **90-second rule**: Category to actionable answer in under 90 seconds
- **One-handed, wet-thumb friendly**: Large tap targets (min 48px), no precision gestures
- **Empathy over information**: Lead with "here's what to do" not "here's what's wrong"
- **Progressive disclosure**: Show the minimum needed, let curious users dig deeper

---

## Changes Overview

### 1. Home Screen: "What's going on?" not "Select a category"

**Current**: Hero image + 4 category cards with descriptions and example chips.

**New**:
- Replace the hero section with a compact, warm greeting: "Something wrong at home? We'll help." with a single-line search input right at the top ("My toilet won't stop running", "AC blowing warm air")
- Below the search: 4 large, icon-forward tap targets (no descriptions, no example chips) -- just icon + label, big enough for a wet thumb
- Add a row of "common issues" quick-tap chips below the categories (e.g., "Leaking faucet", "No hot water", "AC not cooling", "Tripped breaker") that skip the symptom input step entirely
- Remove the "How it works" section from the home screen -- move it to a subtle "How does this work?" link in the footer
- Remove nav links ("For Pros", "Pricing") from the header for now -- this is a single-purpose tool

### 2. Symptom Input: Conversational, not clinical

**Current**: Full textarea with "Describe what's happening" label, upload button, analyze button.

**New**:
- Rephrase to conversational tone: "Tell us what's going on" with placeholder like "It's making a weird noise when..."
- Add voice input button (microphone icon) alongside text -- for hands-busy users (UI only, no backend yet)
- Show 3-4 tappable symptom suggestions specific to the category (pulled from existing `examples` data) so users can tap instead of type
- Make the "Attach photo" button more prominent -- a camera icon button same size as the submit button
- Emergency detection: keep the existing keyword detection but soften the language: "This sounds urgent -- your safety comes first. Please call 911 if you're in danger. We're here when you're safe."
- Enlarge the submit button and make it sticky at the bottom of the viewport on mobile

### 3. Context Questions: Tap-tap-done

**Current**: One question at a time with option buttons, progress bar.

**New**:
- Keep the one-question-at-a-time pattern (it works well for stressed users)
- Make option buttons larger (full-width, min 56px height) with slightly rounded corners
- Add a "Skip this" option on each question for users who don't know or don't care
- Show a time estimate at the top: "2 quick questions, then your diagnosis"
- Auto-advance with a brief animation (already exists, keep it)
- Add haptic-style visual feedback on tap (scale animation)

### 4. Analyzing Screen: Reassure, don't just spin

**Current**: Spinner + "Analyzing your issue" + "Running diagnostic models..."

**New**:
- Replace generic spinner with a 3-step progress indicator that ticks through: "Understanding your issue...", "Checking common causes...", "Building your plan..."
- Add a subtle reassurance line: "This usually takes about 10 seconds"
- Keep it centered and clean

### 5. Results: Action-first, not data-first

**Current**: Header with confidence %, safety badge, causes list with probability bars, cost estimate, next steps grid, micro-consult CTA, feedback.

**New -- restructured for "what do I do NOW?"**:
- **Top card: The verdict** -- A single clear sentence: "Most likely: Worn washer or O-ring" with confidence shown as a simple colored dot (green/yellow/red) not a percentage. The percentage is available on tap/hover for curious users.
- **Safety callout** -- If caution or danger, this appears as a prominent but empathetic banner ABOVE the verdict: "Heads up -- this one needs care. Here's how to stay safe." (not "Professional Required" which sounds like a rejection)
- **"What to do" section** -- The primary CTA area, replacing "Recommended Next Steps":
  - For safe issues: Lead with the DIY fix as a step-by-step card with a big "I'll try this" button
  - For caution/danger: Lead with "Talk to a pro" button, DIY is secondary
  - Each action card has an estimated time and difficulty indicator
- **"Why we think this" (collapsed by default)** -- The causes list with probability bars moves into an expandable accordion. Most users don't need it; power users can open it.
- **Cost estimate** -- Integrated into the action cards rather than a separate section ("Parts: ~$5-50")
- **"Get expert help" sticky footer** -- On mobile, a persistent bottom bar with "Video call a pro -- $15" button when confidence is below 75% or safety isn't "safe"
- **Feedback** -- Simplified to a single row: thumbs up / thumbs down, no button labels

### 6. Micro-Consult: Faster to book

**Current**: Pro selection list, confirm screen, booked screen -- 3 steps.

**New**:
- **Auto-select the best available pro** -- Show the top-rated available pro pre-selected with "Book now" as the primary action. "See other pros" is a secondary link.
- **Collapse the confirm step** -- Show pro details + price + "Book for $18" in a single card, no separate confirmation screen
- **After booking** -- Show a clear "You're all set" message with the time, and a "Add to calendar" button
- Reduce from 3 steps to effectively 1-2

### 7. Mobile-First Touch Targets and Layout

**Current**: Responsive but designed desktop-first.

**New**:
- All interactive elements: minimum 48x48px touch targets
- Bottom-anchored primary actions on mobile (sticky CTA bar)
- Reduce padding and margins on mobile to maximize content area
- Category cards: 2-column grid on mobile (currently 1-col on small, 4-col on large)
- Add `touch-action: manipulation` to prevent double-tap zoom delays

### 8. Tone and Copy Updates Throughout

- Replace "AI Diagnosis" with "Your diagnosis" -- users don't care about AI, they care about answers
- Replace "Analyze Issue" with "What's wrong?" or "Get my diagnosis"
- Replace "New Diagnosis" with "Start over"
- Replace "Confidence" percentage display with plain language: "We're pretty sure" (75%+), "Our best guess" (50-74%), "We're not sure -- talk to a pro" (below 50%)
- All safety warnings lead with empathy: "Your safety matters most" not clinical labels
- Footer disclaimer shortened: "For guidance only -- always consult a licensed pro for major work."

---

## Technical Details

### Files to modify:
1. **`src/pages/Index.tsx`** -- Restructure home screen layout, add quick-tap chips, add search input, remove "How it works" section from main view, simplify header nav
2. **`src/components/CategoryCard.tsx`** -- Simplify to icon + label only, increase touch target size
3. **`src/components/SymptomInput.tsx`** -- Add voice button (UI), tappable suggestions, conversational copy, softer emergency language, sticky submit on mobile
4. **`src/components/ContextQuestions.tsx`** -- Larger buttons, "Skip" option, time estimate, tap animation
5. **`src/components/DiagnosisResults.tsx`** -- Major restructure: action-first layout, collapsible causes, integrated costs, sticky pro CTA, simplified feedback
6. **`src/components/MicroConsult.tsx`** -- Auto-select best pro, collapse confirm step, add calendar button
7. **`src/lib/diagnostic-data.ts`** -- Add quick-issue shortcuts data, add time/difficulty metadata to next steps
8. **`src/index.css`** -- Add mobile-specific utilities (sticky footer, touch-action, larger tap targets)
9. **`tailwind.config.ts`** -- No major changes needed, existing config supports the design

### New components:
- **`src/components/QuickIssueChips.tsx`** -- Row of common-issue tap targets that shortcut to diagnosis
- **`src/components/StickyProCTA.tsx`** -- Mobile bottom bar for pro escalation on results page
- **`src/components/AnalyzingSteps.tsx`** -- Multi-step progress indicator replacing the simple spinner

### No new dependencies required -- everything uses existing Framer Motion, Lucide, Radix, and Tailwind.
