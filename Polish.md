# SAVR — Polish Pass V2

Purpose: UI and clarity improvements without changing the financial engine.

Constraints:
- Do NOT change financial calculations
- Do NOT add accounts, backend, or APIs
- Do NOT introduce new dependencies
- SAVR remains local-first and privacy-first

---

# 1. Dashboard Decision Card Language

Rename the primary decision card title.

Current:
Next Action

Replace with:
Next Move

Alternative allowed:
SAVR recommends

Goal:
Reinforce that SAVR is a **financial decision engine**, not a dashboard.

Do not modify the decision logic or calculations that feed this card.

---

# 2. Budget Screen Copy Improvement

Update helper text for monthly expenses.

Current:
Include all fixed monthly costs — rent, subscriptions, minimum payments for low-APR debts (<10% APR), etc.

Replace with:
Include all **fixed monthly costs** — rent, utilities, insurance, subscriptions, and minimum payments for low-APR debts (<10% APR).

Reason:
Clarifies that SAVR does NOT track individual transactions.

---

# 3. Remove "Monthly cash to goals" (Required)

In the **Emergency Fund card** inside the EF & Debt tab:

REMOVE the row:

Monthly cash to goals

This value is redundant with:
- Spare per month (Budget tab)
- Planner projections
- Timeline estimates

The Emergency Fund card should contain ONLY:

Current balance (editable input)

Target fund (3× monthly expenses)

Progress bar

Optional helper text below progress bar:
"Your emergency fund target is based on three months of essential expenses."

---

# 4. Timeline Expansion

Expand the Timeline card to present the financial journey.

Example structure:

Timeline

Starter Emergency Fund  
~X months

Debt Freedom  
~X months

Full Emergency Fund  
~X months

Values must still derive from existing calculations.

No new financial logic should be added.

---

# 5. Financial Stability Meter (New UI Component)

Add a **Financial Stability** meter to the Dashboard.

Placement:
Above the Snapshot card.

Display:

Financial Stability  
XX%

Or

Financial Stability  
XX / 100

Visual:
Horizontal progress bar.

Approximate weighting model:

Cash Flow Positive → prerequisite

Emergency Fund Coverage → up to 40%

Debt Burden → up to 40%

Positive Monthly Surplus → up to 20%

This is a **directional indicator**, not a financial score.

---

# 6. Snapshot Section (No Logic Changes)

Keep the Snapshot card.

Fields must remain visible:

Monthly income

Monthly expenses

Spare per month

After high-APR minimums

Total debt

Emergency fund

Monthly interest on debts

Required principal

This transparency builds trust in the planner.

---

# 7. Start Here Card Copy

Update onboarding instruction.

Current:
Enter your income and monthly expenses.

Replace with:
Enter your income and fixed monthly expenses.

---

# 8. Typography Improvements

Adjust text hierarchy for better readability.

Keep current sizes for:

App titles  
Section titles  
Card titles

Increase body copy slightly.

Recommended sizes:

Body text → 15–16 pt

Card titles → ~18–20 pt

Page titles → ~32–34 pt

Ensure the following highlight remains prominent:

Spare per month value (green number)

Maintain large size and strong weight.

Recommended:

font-weight: 700

---

# 9. Card Contrast Improvement

Increase contrast between page background and cards.

Current appearance approximately:

Page background ≈ #0F0F0F  
Card background ≈ #1A1A1A

Adjust card background slightly lighter.

Recommended:

Card background: #1F1F1F

Goal:
Improve separation and visual depth.

---

# 10. Button Padding

Increase vertical padding slightly on primary action buttons.

Example buttons:

Open Budget  
Open EF & Debt  
Open Plan

Recommended padding:

padding: 14px 22px

Goal:
Make buttons feel less cramped and more premium.

---

# 11. Preserve Navigation Structure

Bottom navigation should remain:

Dashboard  
EF & Debt  
Budget  
Invest  
Tools

Do not add additional tabs.

Do not reorder tabs.

---

# 12. Maintain Local-First Architecture

SAVR intentionally avoids:

Bank account linking

Transaction tracking

Automatic categorization

Subscriptions

Accounts

Cloud storage

All calculations must remain local.

---

# 13. Preserve Core Engine Inputs

The financial engine must continue to rely on only:

Income

Monthly expenses

High-APR debts

Emergency fund balance

All projections derive from these inputs.

Do not introduce additional required inputs.

---

# 14. UX Philosophy

SAVR is a **financial clarity engine**.

The interface should prioritize:

Clarity over complexity

Direction over dashboards

Decisions over data

Every screen should answer:

"What should I do with my money next?"
# SAVR — Polish Pass V2 Addendum: Share My Plan

Add a **Share My Plan** feature to the Dashboard/Home screen.

Purpose:
Make SAVR output naturally shareable between spouses, friends, and social platforms.
This is both a product delight feature and a distribution feature.

IMPORTANT:
- Keep this lightweight
- Do NOT add backend sharing
- Do NOT add accounts
- Do NOT add cloud storage
- This must work entirely locally on-device

---

# 15. Share My Plan Feature

Add a new button on the Dashboard/Home screen:

Share My Plan

Placement:
- Below the main “Next Move” / “SAVR recommends” card
- Or below the Timeline card if spacing works better
- It should feel like a natural primary secondary action, not the main CTA above editing data

Preferred button label:
Share My Plan

Alternative allowed:
Share Snapshot

Preferred label is:
Share My Plan

---

# 16. Share Card Content

When tapped, generate a clean, attractive shareable card image based on the user’s current SAVR plan.

The share card should include:

SAVR

My Financial Plan

Next Move  
[dynamic next move text]

Starter Emergency Fund  
[dynamic timeline if available]

Debt Freedom  
[dynamic timeline if available]

Full Emergency Fund  
[dynamic timeline if available]

Optional footer text:
Built with SAVR

Do NOT overload the card with too many numbers.

Keep it visually clean and emotionally strong.

The goal is:
- easy to read in iMessage
- easy to post to social
- easy to screenshot
- easy for another person to understand instantly

---

# 17. Share Card Design Requirements

The share card should feel premium and consistent with SAVR.

Use:
- dark background
- rounded card
- strong white typography
- subtle green accent for positive values/highlights
- clear spacing
- no clutter
- no tiny text

The design should match the SAVR app style.

The card should feel like:
- a beautiful summary
- easy to understand in 3 seconds
- worth sending to a spouse/friend

Avoid:
- spreadsheet-like layout
- excessive raw metrics
- too much explanatory copy
- tiny footnotes

---

# 18. Share Card Data Rules

Use current live engine outputs.

Required:
- current priority / next move
- starter EF timeline if available
- debt freedom timeline if available
- full EF timeline if available

If a value is unavailable, omit that line gracefully.

Example:
If there is no debt, do not show Debt Freedom.

If a full EF timeline is not yet meaningful, omit it.

The share card should adapt cleanly to the current financial state.

---

# 19. Native Share Implementation

Implement using Expo-compatible native sharing.

Preferred flow:
1. Render a hidden share card component
2. Capture it as an image
3. Open native iOS share sheet
4. Allow sharing via Messages, AirDrop, Mail, etc.

This must be testable from Expo on-device.

Expected behavior on iPhone:
- Tap Share My Plan
- Native iOS share sheet opens
- User can choose Messages
- User can send the generated image via iMessage

This is a required behavior target.

---

# 20. Technical Implementation Guidance

Use a local-only approach.

Recommended implementation pattern:
- Create a dedicated share card component
- Render it off-screen or in a hidden export container
- Capture it as an image using an Expo-compatible approach
- Pass the image URI into the native share sheet

Suggested structure:

src/components/share/
  SharePlanCard.tsx

src/lib/
  sharePlan.ts

The share card should consume the same engine outputs already shown on the Dashboard.

Do NOT duplicate financial logic inside the share component.
Do NOT hardcode values.

---

# 21. Share Copy Behavior

The shared result should primarily be the image card.

Optional share text can be included in the share sheet payload if supported:

My SAVR plan — this app tells me exactly what to do with my money next.

Keep share text short.

Do not make it feel spammy.

---

# 22. First Version Scope

Version 1 should support:

- sharing current plan as an image
- working from Expo on a real iPhone
- sending via iMessage through the iOS share sheet

Do NOT delay this feature by adding:
- PDF export
- custom themes
- multiple card templates
- social media integrations
- cloud links

Just make the first version work cleanly.

---

# 23. UX Goal

This feature should create a moment where the user can say:

“Look — here’s our plan.”

That is the emotional goal.

This should feel especially natural for:
- spouses
- couples
- accountability partners
- friends discussing money
- users posting their progress online

---

# 24. Final Requirement

After implementing, verify this exact flow on-device in Expo:

- open SAVR on iPhone
- tap Share My Plan
- native share sheet appears
- choose Messages
- send the generated card through iMessage successfully

This should be considered the acceptance test for the first version.