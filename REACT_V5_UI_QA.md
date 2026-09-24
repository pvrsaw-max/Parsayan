# Parsayan React V5 — Premium UI QA

- PASS — src/components/GameShell.jsx
- PASS — src/screens/Setup.jsx
- PASS — src/screens/Board.jsx
- PASS — src/screens/Values.jsx
- PASS — src/screens/SecretPowers.jsx
- PASS — src/screens/Winner.jsx
- PASS — src/screens/TieBreak.jsx
- PASS — iPhone safe areas
- PASS — responsive board
- PASS — premium palette
- PASS — engine untouched syntax
- PASS — V3 full flow still passes
- PASS — V4 secret/resume/tie still passes

**Overall: PASS — 13/13**

## Regression
```
PASS R1 normal +400
PASS auction set
PASS owner wrong -> steal
PASS auction remaining survives
PASS reload steal state
PASS steal +300
PASS hunt transfer
PASS duel score
PASS round 2 begins
PASS undo restores score
PASS reload after undo
PASS round 3 reached
PASS coup eligible
PASS coup +1200
PASS swap succeeds
PASS swap consumes old
PASS swap power consumed
PASS swap blocked after options
PASS fresh reset
FULL FLOW 19/19

PASS 3-card hand A
PASS choose 2 A
PASS secret reload A
PASS 3-card hand B
PASS choose 2 B
PASS secret reload B
PASS 3-card hand C
PASS choose 2 C
PASS secret reload C
PASS 3-card hand D
PASS choose 2 D
PASS secret reload D
PASS secret ends on board
PASS selected powers available
PASS three rounds can tie
PASS tie survives reload
PASS tie winner recorded
PASS new game clears all
SECRET/RESUME/TIE 18/18

```

این QA ظاهر/ساختار و Regression موتور را پوشش می‌دهد. تست لمسی واقعی Safari پس از Deploy لازم است.