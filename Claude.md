# Claude.md — SAVR Native iPhone Rebuild Master Spec
_Last updated: 2026-03-12_

## 0) Core assumption for this rebuild

The latest **SAVR web TypeScript codebase** has been placed in this project root.

That codebase is the **true source of truth** for:

- planner engine
- budget logic
- debt logic
- emergency fund logic
- investing logic
- calculator logic
- state model
- UX intent
- copy/tone
- screen hierarchy

This rebuild is **not** a generic finance app rebuild.

This rebuild is a **native iPhone translation of the existing SAVR product**.

Before implementing major changes, you must **analyze the current codebase thoroughly**.

---

# 1) Locked product decisions

These decisions are already made and must be honored.

1. Product name is **SAVR**
2. Target platform is **iPhone first**
3. Rebuild stack is **Expo + React Native + TypeScript**
4. App must be **local-first**
5. There must be **no login**
6. There must be **no backend**
7. There must be **no cloud persistence**
8. All user data remains **on device only**
9. Monetization direction is **one-time purchase**
10. No subscription model
11. Existing SAVR planning engine must be preserved
12. Mobile rebuild must feel like the same SAVR product

---

# 2) Mission

Translate the existing SAVR web application into a **polished native iPhone application**.

The rebuild must:

- inspect the current codebase first
- extract planner logic
- extract state shapes
- extract calculations
- extract recommendation logic
- preserve sequencing between budget / debt / emergency fund / invest
- remove SaaS-style architecture
- maintain SAVR product identity

---

# 3) Non-negotiable rule

Before writing large portions of new code, you must inspect the codebase.

You must understand:

- routing structure
- state model
- engine logic
- calculations
- recommendation outputs
- store relationships

You must **extract this behavior from the code**, not guess.

---

# 4) Files to inspect first

Inspect the project and locate the real equivalents of these:

- `src/app/`
- `src/components/`
- `src/stores/`
- `src/lib/`
- `src/utils/`
- `src/calculators/` if present
- dashboard/home pages
- budget logic
- debt logic
- emergency fund logic
- investing logic
- helper utilities
- formatting utilities
- selector logic

You must determine **actual file locations**, not rely on assumptions.

---

# 5) Required analysis output

Before rebuilding the app, internally document:

## Screen inventory

For every page:

- route
- purpose
- inputs
- outputs
- state dependencies
- UI sections
- user actions

---

## Store inventory

For every Zustand store:

Document:

- state fields
- actions
- reset functions
- derived selectors
- persistence configuration
- where state is consumed

---

## Engine inventory

Identify:

- planner logic
- recommendation logic
- derived financial metrics
- calculation helpers
- sequencing logic

---

## Calculation inventory

Document how the app calculates:

- income totals
- expense totals
- monthly surplus
- monthly deficit
- emergency fund coverage
- debt totals
- calculator outputs

---

## Recommendation inventory

Determine exactly:

- how current priority is chosen
- how blockers are determined
- how next steps are generated
- how EF / debt / budget / invest interact

Do **not guess**. Extract the real logic.

---

# 6) Preserve the SAVR engine

You must preserve:

- planner sequencing
- recommendation system
- financial logic
- derived outputs
- calculator behavior

You must **not replace** the planner with a generic budgeting algorithm.

The value of SAVR is the integrated planning system already built.

---

# 7) Allowed improvements

You may improve:

- mobile UX
- layout
- navigation
- form inputs
- visual hierarchy
- component structure
- engine isolation
- performance
- empty states
- onboarding

---

# 8) Remove web-specific architecture

Remove:

- login
- auth flows
- SaaS routing
- landing page entry
- backend persistence
- Stripe/subscription ideas

The app should open directly into the product.

---

# 9) Stack requirements

Use:

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- AsyncStorage persistence
- Reanimated
- Gesture Handler
- Safe Area Context
- Expo Haptics

Do not add backend libraries.

---

# 10) Native project structure

Recommended structure:

app/
(tabs)/
_layout.tsx
index.tsx
plan.tsx
budget.tsx
invest.tsx
tools.tsx

onboarding/
index.tsx

settings/
index.tsx

src/
components/
ui/
cards/
forms/

features/
home/
plan/
budget/
invest/
tools/

stores/
engine/
lib/
constants/
types/

---

# 11) Tab mapping

Map web sections to mobile tabs.

Home → dashboard  
Plan → emergency fund + debt planning  
Budget → budget section  
Invest → investing guidance  
Tools → calculators

Use bottom tabs instead of sidebar navigation.

---

# 12) Extract engine to pure modules

Create a dedicated engine folder.

Example:

src/engine/

planner.ts  
budget.ts  
debt.ts  
emergencyFund.ts  
invest.ts  
calculators.ts  
selectors.ts  
types.ts  

Rules:

- pure TypeScript
- deterministic
- typed
- no UI dependencies
- no React dependencies

---

# 13) Reverse-engineer budget logic

Determine:

- income inputs
- expense categories
- totals
- surplus calculation
- which values feed planner engine

Preserve existing calculations.

---

# 14) Reverse-engineer debt logic

Determine:

- debt fields
- balance handling
- APR usage
- payoff logic
- recommendation effects

Preserve existing behavior.

---

# 15) Reverse-engineer emergency fund logic

Determine:

- EF inputs
- EF targets
- EF health calculation
- interaction with budget
- interaction with recommendations

Preserve behavior.
# 16) Reverse-engineer invest logic

Determine:

- investing inputs
- readiness rules
- employer match logic
- sequencing with debt and EF
- planner outputs related to investing

Preserve existing behavior.

---

# 17) Reverse-engineer dashboard logic

Determine:

- summary metrics
- priority card logic
- next step logic
- which selectors drive dashboard UI

This becomes the **Home tab** anchor.

---

# 18) Extract cross-domain sequencing

Identify the real order of financial priorities used by SAVR.

Example possibilities to confirm from code:

- negative cash flow first
- starter emergency fund
- high-interest debt
- expanded emergency fund
- increased investing

Do not assume. Extract real logic.

---

# 19) Planner output model

Engine should expose structured outputs.

Example shape:

type PlannerOutput = {
stage: string
priority: string
headline: string
explanation: string
blockers: string[]
nextSteps: string[]
metrics: {
monthlySurplus?: number
emergencyFundMonths?: number
totalDebt?: number
}
flags: {
negativeCashFlow?: boolean
highPriorityDebt?: boolean
efIncomplete?: boolean
investingReady?: boolean
}
}

---

# 20) Store migration

Inspect current Zustand stores and replicate them.

Likely areas:

budget store  
debt store  
emergency fund state  
invest state  
planner derived outputs  

Preserve naming and conceptual model where possible.

---

# 21) Local persistence

Persist locally:

- budget inputs
- debts
- emergency fund
- invest inputs
- onboarding state
- preferences

Do not build accounts or cloud sync.

---

# 22) Onboarding

Because there is no login, include onboarding.

Goals:

- explain SAVR
- explain local-only data
- explain planning approach
- allow quick setup

Optional quick setup inputs:

income  
essential expenses  
emergency fund  
first debt  

---

# 23) Settings

Include simple settings screen.

Include:

- app version
- reset data
- educational disclaimer
- privacy note
- restore purchase (if needed)

---

# 24) Finance input quality

Requirements:

- numeric keyboards
- currency formatting
- percent formatting
- no cursor jumping
- smooth editing
- clear totals

Finance input UX must be excellent.

---

# 25) Mobile UX rules

Use:

- bottom tabs
- stacked cards
- grouped sections
- mobile friendly forms
- safe areas
- keyboard avoidance

Avoid desktop layout patterns.

---

# 26) Visual design direction

Design should feel:

- calm
- modern
- premium
- trustworthy
- clean

Avoid flashy fintech styles.

Use clear spacing and typography hierarchy.

---

# 27) Copy tone

Tone must be:

- calm
- practical
- educational
- non-judgmental

Avoid:

- finance bro tone
- hype language
- condescending explanations

---

# 28) Legal framing

SAVR is:

educational  
informational  
planning-oriented  

It is not:

financial advice  
investment advisory  
tax advice  

Use plain language disclaimers.

---

# 29) Monetization

Direction:

one-time purchase.

Possible models:

paid app  
or one-time unlock IAP.

Do not implement subscriptions.

---

# 30) Build order

Phase A — analyze codebase  
Phase B — extract planner engine  
Phase C — scaffold native shell  
Phase D — rebuild core screens  
Phase E — polish and onboarding

Do not skip engine extraction.

---

# 31) Testing

Engine tests should include:

negative cash flow  
low emergency fund  
high debt  
balanced finances  
invest readiness  

Manual UI tests:

budget editing  
debt editing  
recommendation updates  
reset flow  
app restart persistence

---

# 32) Final directive

Build a **native iPhone version of SAVR** that preserves the real planner engine and behavior from the existing web codebase.

Success means:

- planner logic matches web version
- state model matches web version
- UX feels native
- all data remains on device
- product feels premium
- suitable for one-time purchase launch