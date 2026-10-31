# البنية وقرارات التصميم

## 1) تدفق البيانات

```
content/challenges.json ──(خادم فقط)──▶ lib/challenges.ts
                                            │  toPublicChallenge()  ← يحذف الاختبارات المخفية والحل المرجعي
                                            ▼
                          صفحات app/** (مكوّنات خادمية) ──props──▶ مكوّنات 'use client'
```

**القاعدة:** لا يستورد أي مكوّن عميل `content/*.json` ولا `lib/challenges`. تفرض ذلك قاعدة ESLint
(`no-restricted-imports` في `.eslintrc.json`)، ويختبره `tests/public-challenges.test.mjs`
(يتأكد أن مدخلات أي اختبار مخفي لا تظهر في الحمولة العامة).

## 2) تشغيل كود المستخدم (المنفّذ المعزول)

```
ChallengeWorkspace ──runInSandbox()──▶ <iframe sandbox="allow-scripts" src="/runner">
                                            │ postMessage (منشأ مجهول "null")
                                            ▼
                                   Worker من Blob  ← new Function(code)
```

- `/runner` يُخدَّم بسياسة **RUNNER_CSP**: `default-src 'none'; connect-src 'none'; worker-src blob:` — فلا شبكة ولا صور.
- الإطار بلا `allow-same-origin`: لا يصل إلى `localStorage` ولا ملفات تعريف الارتباط ولا واجهات `/api`.
- المهلة تُفرض من الصفحة الأم: عند غياب أي رد 3 ثوانٍ يُنهى الـ Worker ويُحذف الإطار.
- المقارنة صارمة (`COMPARE_FN_SOURCE` في `lib/runner-html.mjs`): لا تساوي بين `true` و`1`، ولا بين `null` و`undefined`.

**حدود معروفة:** لا يمكن للمتصفح فرض حدّ للذاكرة. وهذا المسار **لا يمنح نقاطًا رسمية**.

## 3) سياسات الأمان (`middleware.ts` + `lib/security.mjs`)

| المسار | CSP | الإطارات |
|---|---|---|
| كل الصفحات | `script-src 'self' 'unsafe-inline'` (+ `'unsafe-eval'` في التطوير فقط)، `connect-src 'self'` + عنوان Supabase | ممنوعة (`DENY`) |
| `/runner` | RUNNER_CSP أعلاه | `SAMEORIGIN` |

**لماذا `'unsafe-inline'` للسكربتات؟** Next.js (App Router) يحقن سكربتات مضمّنة لنقل بيانات الصفحة.
حجبها يعطّل التفاعل بالكامل. البديل الأشد هو CSP بـ nonce عبر middleware، لكنه يجعل الصفحات ديناميكية
بالكامل؛ وهو تحسين مستقبلي (انظر [دليل Next.js للـ CSP](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)).
النسخة السابقة كانت تمنع السكربتات المضمّنة وتسمح بـ `unsafe-eval` عامًّا، فكانت تعطّل الموقع في الإنتاج وتضعف الحماية معًا.

## 4) المسارات

| المسار | النوع | الوصف |
|---|---|---|
| `/` | خادمي | الرئيسية + تجربة أول تحدٍّ |
| `/challenges` | خادمي + عميل | المكتبة (بحث ومرشحات) |
| `/challenges/[slug]` | SSG (`generateStaticParams`) | صفحة التحدّي ومحرّره |
| `/progress` | خادمي + عميل | أدوات التعلّم التجريبية |
| `/runner` | Route Handler ثابت | المنفّذ المعزول |
| `/api/*` | خادم | واجهات تتطلب `Authorization: Bearer` (انظر wave1/INTEGRATION) |

## 5) الاختبارات

`npm test` يشغّل: منطق الموجة 1، المحتوى، الأمان (ترويسات CSP)، الإسقاط العام (عدم تسريب الاختبارات المخفية)،
ومقارنة القيم في المنفّذ. اختبار المنفّذ داخل متصفح حقيقي (سيناريوهات: نجاح، فشل، حلقة لا نهائية، خطأ صياغة، محاولة `fetch`)
أُجري يدويًا أثناء التطوير؛ يمكن نقله إلى Playwright في CI لاحقًا.

## 6) ما ينقص (بالترتيب)

1. **مصحّح خادمي** (Piston/Judge0) لاستقبال `{challengeId, code}` وتشغيل كل الاختبارات المخفية وتسجيل النقاط (`record_verified_solve`).
2. دعم Python (Pyodide) كخيار بطلب صريح.
3. الدوري الأسبوعي والغرف.
4. `package-lock.json`: نفّذ `npm install` مرة وادفع الملف الناتج ليكون البناء قابلًا للتكرار.
