# Parsayan React V6 — Real Question Bank QA

- PASS — 80 knowledge questions
- PASS — 8 knowledge categories
- PASS — 10 per category
- PASS — 2 per difficulty
- PASS — 4 options each
- PASS — correctIndex valid
- PASS — explanations present
- PASS — 30 challenges
- PASS — full-flow regression
- PASS — secret/resume/tie regression

**Overall: PASS — 10/10**

بانک شامل ۸۰ سؤال دانشی واقعی (۸ دسته × ۱۰ سؤال) و ۳۰ چالش است. در هر دسته برای هر سطح ۲۰۰/۳۰۰/۴۰۰/۵۰۰/۶۰۰ دقیقاً دو سؤال وجود دارد. هر سؤال چهار گزینه، correctIndex، توضیح کوتاه و ID یکتا دارد.

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
