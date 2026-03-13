

## Problem

When "Call a Pro" is triggered from the **GuidedFixMode** (mid-repair), ending the call navigates to the **results** screen instead of back to the guided fix step. The `onBack` for `ProVideoCall` is hardcoded to `setStep("results")` regardless of where the call originated.

## Solution

Track the **previous step** before entering the pro call, and use that to navigate back when the call ends.

### Changes in `src/pages/Index.tsx`

1. Add a `previousStep` state variable (`useState<Step | null>(null)`).
2. Before transitioning to `"pro"`, save the current step:
   - From `DiagnosisResults`: `previousStep = "results"`
   - From `GuidedFixMode`: `previousStep = "guided"`
3. Update `ProVideoCall`'s `onBack` to `setStep(previousStep ?? "results")` so it returns to whichever screen initiated the call.

This is a ~5-line change in `Index.tsx` only. No changes needed in child components.

