# Parsayan V15 — Browser/UI Hardening

## Scope
Second-pass UI/runtime audit after V14 state-machine hardening, focused on React interaction paths, Safari/PWA-adjacent behavior, secret-power privacy, timer lifecycle, and engine/UI contract enforcement.

## Bugs fixed
1. Secret-power selections leaked visually into the next player's screen because component-local `picked` state survived player handoff. Fixed by resetting selection on player-name change.
2. Knowledge-question correct/wrong controls were visible before options were revealed. Engine rejected the action, but UI exposed an invalid action. Controls are now gated until options are visible (challenges remain judgeable directly).
3. Auction countdown repaint interval continued firing after the deadline until the host recorded the result. It now stops itself at the deadline.
4. Engine allowed a personal power that was not one of the player's two secret selected powers if called outside the normal UI. `armPower` now enforces the selected-power contract whenever a secret selection exists.
5. `duelResult` could be called directly without first arming the Duel power. It now requires `activePower === "دوئل"`, closing an engine-level bypass.
6. Storage schema/key bumped to V15 to avoid stale incompatible transient state being treated as current state during this pre-release cycle.

## Verification
- Browser hardening regression: 8/8 PASS
- State-machine simulation: 1000 complete games PASS
- V13 stress/edge: 36/36 PASS
- V12 deep audit: 34/34 PASS
- Audit regression: 10/10 PASS
- Full flow: 19/19 PASS
- Secret/resume/tie: 18/18 PASS

## Build/runtime limitation
A real `npm install` was attempted again under Node v22.16.0 / npm 10.9.2 with a 180-second limit. It timed out before dependencies were installed. Therefore a real Vite production build, service-worker generation, browser rendering, iOS Safari touch behavior, Add-to-Home-Screen behavior, and real PWA resume/update behavior are **not yet certified** in this environment.

## Product-rule item intentionally not changed
Challenge questions still use the generic 200/300/400/500/600 value-selection screen while the challenge bank itself has no difficulty tiers. This is a game-design decision, not silently changed in this technical hardening pass.
