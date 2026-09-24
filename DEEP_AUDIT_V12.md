# Parsayan V12 — Deep Line-by-Line Audit

## Scope
Second-pass audit of engine, React flow, persistence, PWA config, 400-question bank, 60 challenges, 40 duels, and regression tests.

## Newly found and fixed defects
1. Auction steal state could survive reload while the steal modal disappeared. The UI now derives the steal overlay from persisted game state.
2. Auction countdown was display-only and did not enforce the deadline. Expired answers are now scored as wrong, and the countdown refreshes live.
3. Owner scoring could be triggered again while a steal was pending / after resolution. State-machine guards now block double scoring.
4. Knowledge questions could be judged before options were revealed. Real bank questions now require options first.
5. Swap could be used after an auction had already been registered for the old stem. This is now blocked.
6. An already armed power could be overwritten by another power. Engine and UI now block stacking/overwriting.
7. Question-screen Back allowed a free reroll without consuming the shown question. Removed the unsafe reroll path; Undo remains available.
8. Hydration forcibly reset `resolving`, weakening reload safety. Hydration now preserves and normalizes transient state.
9. Storage still used the legacy `parsayan_react_v1` key. State is now versioned as `parsayan_state_v12` with schemaVersion 12.
10. Reserved object-property player names such as `__proto__` could corrupt score maps. They are rejected; player names are also length-limited.
11. Secret-power selection did not validate that the submitting player was the current private-selection player and allowed duplicate submit attempts. Both are blocked.
12. Tie resolution did not require the game to actually be in tie-break phase. It now does.
13. Duel engine accepted a previously used duel ID. Duplicate duel resolution is now rejected.
14. A unique finished winner was not explicitly stored by `finishOrTie`; the UI only inferred it. Winner is now stored in state.
15. Answer-position bias was severe: before V12, option A held 168/400 correct answers while D held only 51/400. V12 deterministically balances the correct slots to exactly 100/100/100/100 without changing answers.
16. Several duel `seconds` metadata values disagreed with their written rules (15/20/30 seconds). Metadata now matches the rule text.
17. PWA manifest had no install icons. 192px and 512px icons, manifest icon declarations, scope, and Apple touch icon were added.
18. New Game had no destructive-reset confirmation. A confirmation now explains that players, scores, powers and history will be cleared.
19. Coup arming is now validated in the engine, not only by UI visibility.
20. Power-hand generation and state hydration gained malformed/legacy-state guards.

## Question-bank audit
- 400 knowledge questions total.
- 8 categories × 50 questions.
- 10 questions at each value (200/300/400/500/600) in every category.
- 400 unique IDs.
- 400 unique question texts.
- Every question has exactly four unique options, valid `correctIndex`, and an explanation.
- Correct-answer positions are exactly balanced: A=100, B=100, C=100, D=100.
- Reworded ambiguous items including Saturn's rings, cheetah speed, standard Mandarin, South Africa's capital-role wording, Chopin nocturne wording, and Career Golden Slam.
- Replaced a set of under-difficult 600-point items in mathematics, computing/general knowledge, and history with harder but still solvable items.
- Existing V11 corrections remain in force for Sagrada Família, Citizen Kane, decathlon/heptathlon, Planck relation, ISBN-13, RGB, and other previously identified items.

## Challenge / duel audit
- 60 unique challenges with unique IDs.
- 40 unique duels with unique IDs and complete title/topic/rule/time metadata.
- Challenge and duel tracking remain separate from knowledge-question tracking.

## Automated results
- DEEP AUDIT V12: 34/34 PASS
- AUDIT REGRESSION: 10/10 PASS
- FULL FLOW: 19/19 PASS
- SECRET / RESUME / TIE: 18/18 PASS
- Node syntax checks: engine/data/Vite config PASS

## Remaining verification boundary
`npm install` was attempted again in the audit environment and timed out at 120 seconds. Therefore a real Vite production build and real iPhone Safari/PWA touch test are **not** claimed as passed yet. This is an environment/install verification gap, not a hidden PASS.

The question bank has received a full structural/consistency/ambiguity/difficulty pass and targeted source verification for rules or facts that were most likely to be nuanced. It is not represented as 400 separate externally cited research records; a publication-grade source ledger per question would be a separate dataset.
