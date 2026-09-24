# Parsayan V11 — Full Code & Question Audit

## Scope
- Source files reviewed from entry point through UI, store, engine, screens, PWA config and data modules.
- 400 knowledge questions checked structurally (IDs, category/value distribution, four unique options, valid answer index, explanation, duplicate exact text).
- 60 challenges and 40 duel records checked for IDs/data contracts.
- High-risk/current rule questions cross-checked against official rule/standards sources where applicable.

## Bugs found and fixed
1. **Critical build/import bug:** `App.jsx` imported `{duels}` while `duels.js` exported `duelTopics`. Fixed with aliased import.
2. **Duel UI data mismatch:** UI rendered `modal.topic.text`, but duel records use `title/topic/rule`; duel instruction could appear blank. Fixed.
3. **Challenge repeat bug:** engine compared category to exact `"چالش"`, while actual category is `"🎭 چالش"`; completed challenges were being written to `usedQuestions`, not `usedChallenges`. Fixed with category helper.
4. **Invalid steal mutation risk:** `stealResult` had no active-auction validation. Added guard.
5. **Invalid duel result risk:** engine accepted same/nonexistent winner and loser. Added validation.
6. **Tie-break fake point:** old implementation added +1 to winner score just to break sorting. Replaced with explicit `winner` state; scores remain truthful.
7. **Power timing exploit:** Double/Insurance/Hunt could be activated after seeing the question. Question-stage power menu now exposes only Swap; pre-question powers stay on board stage.
8. **Auction-after-options exploit:** auction button remained available after options were revealed. Now hidden after reveal and when Insurance is active.
9. **Swap timing issue:** Swap could be armed from the board. It is now restricted to question stage and still blocked after options.
10. **Double-or-Nothing invalid value UX:** selecting 200/300 after arming Double could lead to an engine rejection after the question. Selection is now blocked before entering the question.
11. **Power + Challenge conflict:** personal knowledge-question power could leak into Challenge. Entering Challenge cancels an armed personal power without consuming it.
12. **Predictable question order:** knowledge questions always selected first-unused. Selection is now random among unused questions in the chosen cell.
13. **Dependency reproducibility:** `package.json` used `latest` for all packages. Versions pinned and build tools moved to devDependencies.
14. **Unused store import:** removed `reset` import from App.
15. **Question wording/content issues:** corrected awkward Friends wording, Nepal flag wording, Earth naming question, binary wording, Sagrada wording, Citizen Kane wording, South Africa capital wording, and several semantic duplicates.
16. **Difficulty calibration:** replaced/reworked multiple too-easy 600-point questions, especially math, sports, science and general knowledge.

## Question-bank audit result
- Knowledge questions: **400**
- Categories: **8**
- Questions per category: **50**
- Questions per category per level: **10**
- Unique IDs: **400/400**
- Unique exact question texts: **400/400**
- Four unique options: **400/400**
- Valid correct answer index: **400/400**
- Non-empty explanations: **400/400**
- Challenges: **60**
- Duels: **40**

## Regression tests
- New audit regression: **10/10 PASS**
- Full game flow: **19/19 PASS**
- Secret powers / resume / tie: **18/18 PASS**

## Remaining release blocker
A production Vite build was attempted, but this execution environment did not finish `npm install` within the available tool window, so `node_modules` was unavailable and `vite build` could not be executed here. This is explicitly **not** marked as a build pass. Before GitHub Pages release, run/install dependencies and confirm the production build plus real iPhone Safari touch/PWA behavior.
