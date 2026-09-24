# Parsayan V14 — State Machine Hardening

## هدف
کاهش «خانواده‌های باگ» با انتقال ناوبری و تغییرات حساس بازی از App.jsx به APIهای محافظت‌شده موتور بازی.

## تغییرات معماری
- schemaVersion به 14 ارتقا یافت.
- APIهای مرکزی اضافه شدند: `startGame`, `selectCategory`, `backFromValues`, `selectQuestion`, `revealOptions`.
- UI دیگر `phase`, `question`, `value`, `optionsRevealed` را برای مسیر اصلی مستقیماً تغییر نمی‌دهد.
- `PHASES` و `LEGAL_PHASE_EDGES` به‌عنوان قرارداد State Machine اضافه شدند.
- `assertInvariants` اضافه شد تا Stateهای غیرممکن شناسایی شوند.
- Store هنگام Load علاوه بر hydrate، invariantها را بررسی می‌کند و State ناسالم را اجرا نمی‌کند.
- باگ جدید کشف و رفع شد: پس از ثبت نتیجه Duel، `activePower="دوئل"` پاک نمی‌شد و می‌توانست وارد سؤال بعدی شود.
- انتخاب سؤال، نمایش گزینه‌ها، برگشت از Values و شروع بازی همگی Guard سطح Engine دارند؛ UI به‌تنهایی نمی‌تواند مسیر غیرمجاز بسازد.

## تست تصادفی / Simulation
تست `stateMachineV14.test.mjs` با seed ثابت اجرا شد:
- 1,000 بازی کامل
- 2 تا 10 بازیکن در هر بازی
- 17,907 نوبت اصلی
- 3,326 حراج
- 448 تعویض سؤال
- 3,873 فعال‌سازی Power
- 99,733 بررسی invariant
- Save/Load تصادفی در طول بازی‌ها
- تلاش برای Transitionهای غیرمجاز

نتیجه: PASS

## Regression
- Full Flow: 19/19 PASS
- Secret / Resume / Tie: 18/18 PASS
- Audit Regression: 10/10 PASS
- Deep Audit V12: 34/34 PASS
- Stress Edge V13: 34/34 PASS
- State Machine V14: PASS (1,000 simulated games / 99,733 invariant checks)

## محدودیت باقی‌مانده
این تست‌ها موتور و State را سخت‌تر کرده‌اند، اما جای Browser E2E واقعی را نمی‌گیرند. Production build و تست واقعی Safari/PWA هنوز باید جداگانه انجام شوند.
