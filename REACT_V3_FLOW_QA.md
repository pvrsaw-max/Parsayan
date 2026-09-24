# Parsayan React V3 — Flow / Reload QA

- PASS — engine syntax
- PASS — full flow test
- PASS — Swap engine
- PASS — Hydration
- PASS — Auction reload helper
- PASS — Swap UI
- PASS — PWA retained
- PASS — GitHub Pages relative base

## Full game scenario
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
```

**Overall: PASS — 8/8**

این دور مشخصاً Swap، Undo→Reload، Auction→Reload، سه دور، Coup، Duel و Fresh Reset را پوشش می‌دهد. تست Browser/Safari واقعی همچنان بعد از Deploy انجام می‌شود.