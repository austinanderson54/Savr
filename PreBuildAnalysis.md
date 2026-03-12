# Pre-Build Analysis Prompt for Claude — SAVR Native Rebuild

Before rebuilding anything, analyze this entire codebase and produce a detailed implementation report.

## Your job in this phase

Do **not** start the mobile rebuild yet.

Your first task is to reverse-engineer the current SAVR web app in this repository so you can preserve its real behavior in the native iPhone rebuild.

Treat the existing codebase as the source of truth.

You must inspect the actual code and then produce a structured report.

---

# Goals of this analysis

I need you to determine, from the real codebase:

1. the current screen/page structure
2. the current navigation structure
3. the current Zustand store structure
4. the exact planner engine behavior
5. the exact calculations used across the app
6. how budget, debt, emergency fund, and invest logic interact
7. how the dashboard/home view decides what to show
8. what calculators currently exist and how they work
9. what copy/tone patterns should be preserved
10. what should be ported directly vs improved for mobile

Do not guess.
Do not give me generic best practices.
Extract the real behavior from this codebase.

---

# Required output format

Produce your report in the exact sections below.

---

## 1) Executive summary

Give me a concise but concrete summary of what SAVR currently is, based on the codebase.

Include:
- what type of product it is
- what its core value appears to be
- what the key feature areas are
- what the planning engine seems to do at a high level

---

## 2) File/folder map

List the important files and folders you found that matter for the rebuild.

Include at minimum:
- app routes/pages
- layout/shell/navigation files
- Zustand stores
- planner/calculation/helper files
- calculator-related files
- any shared UI components heavily tied to logic

For each important file, explain why it matters.

---

## 3) Current screen inventory

For every major screen/page in the current web app, provide:

- route/path
- file path
- purpose of the screen
- main UI sections
- what user inputs exist on that screen
- what outputs/summaries/recommendations appear on that screen
- which stores/helpers/selectors it depends on
- what should likely become its mobile equivalent

I want a complete inventory for:
- dashboard/home
- emergency fund + debt area
- budget area
- invest area
- calculators area
- landing/login only if they exist, but note whether they should be discarded for native

---

## 4) Zustand store inventory

Inspect every store and document:

- file path
- store name
- full state shape
- all action/setter functions
- any reset functions
- any derived values/selectors inside the store
- persistence behavior
- where the store is used in the UI

Be very explicit.

I want to understand:
- which store owns what
- what data is canonical
- what data is derived
- which pieces of state are most important to preserve in the native rebuild

---

## 5) Planner engine analysis

This is the most important section.

Identify the real planner/recommendation logic in the codebase and explain it in detail.

I need you to determine:

- how the app decides the current priority
- how the app chooses next steps
- how it identifies blockers
- how monthly budget health affects recommendations
- how emergency fund status affects recommendations
- how debt status affects recommendations
- how investing readiness is determined
- how different parts of the app combine into one overall financial plan

Do not give me generic finance advice.
Tell me exactly what this codebase is doing.

If the logic is scattered across multiple files, trace it and consolidate it into one understandable explanation.

---

## 6) Budget logic analysis

Explain the current budget system in detail.

I need:

- all budget fields
- category structure
- how totals are calculated
- how surplus/deficit is calculated
- any fixed assumptions
- any special cases
- any derived summaries shown to the user
- how budget values feed the planner engine

Be concrete and code-anchored.

---

## 7) Debt logic analysis

Explain the current debt system in detail.

I need:

- debt item fields
- how debts are added/edited/removed
- how debt totals are calculated
- how APR is used
- how minimum payment is used
- how debt affects recommendations
- whether payoff ordering is explicit or implied
- any derived debt summaries or metrics shown in the UI

---

## 8) Emergency fund logic analysis

Explain the emergency fund system in detail.

I need:

- what EF inputs exist
- what EF targets exist
- how EF progress/health is calculated
- whether there is a starter EF concept
- whether there is a full EF concept
- how EF status changes recommendation sequencing
- how EF relates to budget values

---

## 9) Invest logic analysis

Explain the investing section in detail.

I need:

- all investing-related inputs
- any toggles/acknowledgements
- any retirement/employer-match logic
- how the app determines readiness to invest more
- how investing logic depends on budget/debt/EF state
- what outputs/explanations are shown in the UI

---

## 10) Dashboard/Home logic analysis

Explain exactly how the current dashboard/home/root screen works.

I need:

- what summary cards/sections it shows
- what metrics it emphasizes
- how it decides what to highlight first
- how “what to do next” is determined
- which stores/helpers feed it
- what should become the Home tab anchor in the native app

---

## 11) Calculators analysis

Inventory every calculator/tool currently in the app.

For each calculator, tell me:

- file path
- purpose
- inputs
- outputs
- whether it uses global store state or standalone local state
- whether it should port directly to native
- any logic worth extracting into shared engine utilities

---

## 12) Cross-domain sequencing map

I want you to reconstruct the exact financial sequencing that SAVR currently implies.

For example, determine from the code whether the app effectively prioritizes things in a sequence like:

- fix negative cash flow
- build starter emergency fund
- pay down certain debt
- expand emergency fund
- increase investing

But do **not** assume that sequence.
Extract the actual one from the code.

I want a clear ordered map of:
- stage/order
- trigger conditions
- what recommendation appears
- what changes the user to the next stage

This is critical.

---

## 13) Copy/tone analysis

Analyze the current copy and tone used in the app.

I need to know:
- what tone the app currently has
- which phrases or patterns are worth preserving
- whether the voice is more educational, directive, calming, etc.
- which copy areas are especially strong and should be carried into native

---

## 14) Mobile translation plan

Based on the real current codebase, propose how each major area should translate to native iPhone.

I want:

- web route/page → native screen mapping
- sidebar/navigation → bottom tab mapping
- desktop layouts → mobile layouts
- forms that need redesign for mobile
- logic that should move into pure engine files
- things that should remain conceptually identical
- things that should be cleaned up while preserving behavior

Be specific and tied to the codebase.

---

## 15) Engine extraction plan

Tell me exactly how you would extract the current planner/business logic into pure TypeScript modules for the native rebuild.

Propose:

- candidate files/functions to extract
- which logic is currently embedded in components
- which logic belongs in `planner.ts`, `budget.ts`, `debt.ts`, `emergencyFund.ts`, `invest.ts`, `calculators.ts`, `selectors.ts`
- what the final planner output shape should look like

This should be a practical extraction plan, not abstract advice.

---

## 16) Native store migration plan

Based on the current Zustand stores, tell me how to recreate them for the native app.

I need:

- which stores should remain separate
- which state should persist locally
- which derived values should be recomputed instead of stored
- what local persistence approach should be used
- any cleanup/refactor opportunities that would not break parity

---

## 17) Risks / ambiguity list

List any parts of the current codebase that are ambiguous, scattered, duplicated, or fragile.

For each item:
- explain the ambiguity
- explain the likely correct interpretation
- explain how you would preserve behavior safely during the native rebuild

---

## 18) Final rebuild recommendations

End with a practical summary of:

- what absolutely must be preserved
- what can be improved
- what should be removed
- what the build order should be for the native rebuild

---

# Important rules for this analysis

1. Base everything on the actual code in this repository.
2. Do not invent product behavior that is not present.
3. Do not substitute generic finance best practices for the real implemented SAVR logic.
4. When behavior is scattered, trace it across files.
5. Quote file paths and function/store names precisely where helpful.
6. Prefer concrete findings over abstract advice.
7. This analysis is meant to enable a faithful iPhone rebuild.

After you finish this analysis report, do **not** start coding yet.
Wait for the next instruction.