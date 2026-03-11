

## Fix: Remove Redundant Circuit Breaker Question

### Problem
When users go through the **scanner flow**, the breaker question is asked as a slide-up popup in `LiveScanner` (lines 431-463). Then when `onAnalyze` transitions to the `context` step, the **same breaker question** appears again as the first item in `DRYER_QUESTIONS`.

The **text input flow** (home → context) skips the scanner entirely, so the breaker question in `DRYER_QUESTIONS` is still needed for that path.

### Solution
Track whether the user came from the scanner. If so, pre-fill the breaker answer so `ContextQuestions` skips it (shows it as a collapsed answered row or skips entirely).

### Changes (2 files)

**`src/pages/Index.tsx`**
- Add state: `const [cameFromScanner, setCameFromScanner] = useState(false)`
- In the scanner's `onAnalyze` handler, set `setCameFromScanner(true)` before `setStep("context")`
- In `handleTextSubmit`, ensure `setCameFromScanner(false)`
- Pass a `prefilled` prop to `ContextQuestions` when coming from scanner:
  ```
  prefilled={{ breaker: "Yes, breaker looks fine" }}
  ```
  (The scanner already handles both breaker outcomes — "fine" continues to analyze, "let me check" → fixed/still broken. So by the time we reach context, the breaker has been confirmed fine.)
- Reset `cameFromScanner` in both reset handlers

**`src/components/ContextQuestions.tsx`**
- Add optional `prefilled?: Record<string, string>` to `ContextQuestionsProps`
- Merge `prefilled` into the initial `inferred` answers so those questions appear as already-answered collapsed rows (or are skipped if all conditional children are also resolved)
- This uses the existing inference/skip machinery — no new logic needed

This way:
- **Scanner path**: breaker is pre-answered, user sees it collapsed or skipped entirely
- **Text path**: breaker question appears normally as before
- No questions are removed, so no behavioral change for the text flow

