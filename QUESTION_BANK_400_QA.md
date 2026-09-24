# Parsayan V10 — 400 Question Bank QA

- PASS — 200 new V10 questions
- PASS — 400 total knowledge target
- PASS — 50 per category
- PASS — 10 per level/category target
- PASS — 4 options each
- PASS — valid correctIndex
- PASS — unique IDs
- PASS — explanations present
- PASS — full-flow regression
- PASS — secret/resume/tie regression

**Overall: PASS — 10/10**

بانک دانشی اکنون **۴۰۰ سؤال** دارد: ۸ دسته × ۵۰ سؤال؛ در هر دسته و هر سطح ۲۰۰/۳۰۰/۴۰۰/۵۰۰/۶۰۰ دقیقاً ۱۰ سؤال. ۲۰۰ سؤال این مرحله در `questionExpansion2.js` جدا شده‌اند و گزینه‌ها به‌صورت deterministic جابه‌جا شده‌اند تا پاسخ صحیح همیشه گزینه اول نباشد.

نکته QA: بررسی ساختاری و Regression کامل اجرا شده است. برای انتشار عمومی، Audit منبع‌به‌منبعِ تمام ۴۰۰ سؤال هنوز یک مرحله مستقل است و نباید این گزارش را معادل fact-check بیرونی کامل دانست.
