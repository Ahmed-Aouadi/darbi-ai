# «سَطر» — المواصفات الرئيسية المفصّلة (Master Spec)

> هذا الملف هو **المرجع الوحيد** للمشروع. أعطه للأداة التي ستبني الموقع، مع ملفات `challenges.json` و`tracks.json` و`sattar-content-pack.md`. عند أي تعارض مع برومبتات سابقة، **هذا الملف هو الأصل**.
>
> **ترتيب الاستخدام:** (1) هذا الملف + ملفات المحتوى ← (2) اطلب بناء المراحل 1 إلى 5 ← (3) ألصق «برومبت الإكمال والتجهيز النهائي» للفحص والإصلاح.

---

## 1) تعريف المنتج

**الاسم:** سَطر (مؤقت). **الشعار:** «برمج مشاكل حيّك». **اللغة:** الواجهة بالعربية (RTL)، والكود بالإنجليزية. **اللغات المدعومة في الحل:** JavaScript وPython.

**الوعد:** تحلّ مسائل برمجية من حياتك اليومية في الجزائر، فتأتيك النتيجة فورًا، وتنافس أصدقاءك كل أسبوع.

### الشخصيات المستهدفة
1. **ياسين، 16 سنة، تلميذ:** يتعلم البرمجة من الهاتف، وإنترنته متقطع، ويحب التحدي مع أصحابه. يحتاج مسائل سهلة وشرحًا بسيطًا وتلميحات.
2. **سلمى، 21 سنة، طالبة إعلام آلي:** تريد تدريبًا منتظمًا وسجلًا يظهر في سيرتها. تحتاج مسائل أصعب وترتيبًا عامًا وملفًا شخصيًا يُشارَك.
3. **رضا، 28 سنة، مبرمج هاوٍ ومنظّم مجموعة أصدقاء:** يريد غرفة خاصة لدوري أسبوعي مع زملائه. يحتاج رمز دعوة وترتيبًا خاصًا وملخصًا أسبوعيًا للمشاركة.

### حلقات الاستخدام الأساسية
- **حلقة اليوم:** يفتح الموقع ← يحلّ تحديًا ← يرى النقاط والسلسلة ← يرجع غدًا للحفاظ على السلسلة.
- **حلقة الأسبوع:** يدخل الدوري ← يحلّ تحديات الأسبوع ← يتابع الترتيب مع أصدقائه ← يرى ملخص الأسبوع ← يبدأ أسبوعًا جديدًا.

## 2) خريطة الصفحات والمسارات

| المسار | الصفحة | الدخول | العرض |
|---|---|---|---|
| `/` | الرئيسية | عام | ثابت (SSG) |
| `/challenges` | مكتبة التحديات | عام | ISR |
| `/challenges/[slug]` | صفحة التحدّي | عام (التسليم يتطلب حسابًا بعد أول محاولة) | ISR + عميل |
| `/tracks` و`/tracks/[id]` | المسارات | عام | ISR |
| `/league` | دوري الأسبوع | عام للعرض، حساب للمشاركة | ديناميكي |
| `/league/archive` | أرشيف الأسابيع | عام | ISR |
| `/rooms` و`/rooms/[code]` | الغرف | حساب | ديناميكي |
| `/u/[username]` | الملف الشخصي | عام (أو خاص بالإعداد) | ديناميكي |
| `/settings` | الإعدادات | حساب | ديناميكي |
| `/welcome` | شاشة الترحيب (3 خطوات) | حساب جديد | عميل |
| `/admin/*` | الإدارة | دور admin | ديناميكي |
| `/about` `/rules` `/faq` `/privacy` `/terms` `/suggest` | صفحات مساعدة | عام | ثابت |
| `/offline` | بلا اتصال | عام | PWA |

## 3) رحلات المستخدم خطوة بخطوة

### 3.1 زائر جديد (بلا حساب)
1. يفتح `/` ← يرى المحرّر المصغّر مع تحدّي «أقرب حافلة» مبسّطًا.
2. يكتب حلًّا ← يضغط «شغّل» ← تظهر نتائج الأمثلة الظاهرة فورًا (JavaScript فقط).
3. عند نجاح كل الأمثلة ← تظهر لافتة: «أحسنت! أنشئ حسابًا لتحفظ تقدّمك وتنافس أصدقاءك».
4. إن ضغط «ليس الآن» يبقى يلعب؛ تُحفظ المحاولات في `localStorage` وتُربط بحسابه حين ينشئه.

### 3.2 إنشاء حساب
1. شاشة واحدة: حقل بريد + زر «أرسل لي رابط الدخول» + زر Google.
2. يصل رابط سحري ← يفتحه ← `/welcome`.
3. الخطوة 1: اسم المستخدم (إنجليزي صغير وأرقام وشرطة سفلية، 3–20 حرفًا، فريد، مع فحص فوري).
4. الخطوة 2: اللغة المفضلة (JavaScript / Python) والمستوى (أبدأ للتو / أعرف الأساسيات / متمرّس).
5. الخطوة 3: الهدف الأسبوعي (تحدّيان / 4 تحديات / 7 تحديات). ثم الانتقال للتحدي المقترح الأول.

### 3.3 حلّ تحدٍّ (المسار الذهبي)
1. من `/challenges` أو المسار ← يفتح صفحة التحدّي.
2. يقرأ القصة والمطلوب والأمثلة.
3. يكتب الكود (يُحفظ تلقائيًا كل ثانيتين).
4. «شغّل» (Ctrl+Enter): يختبر الأمثلة الظاهرة فقط، دون احتساب محاولة.
5. «سلّم الحل»: يشغّل كل الاختبارات، **ويُحتسب محاولة**. إن فشل: تظهر نتيجة كل اختبار؛ بعد محاولتين فاشلتين يظهر زر «تلميح».
6. عند النجاح: تُحسب النقاط ويظهر ملخص (النقاط، الزمن، الشارات الجديدة) وزر «التحدي التالي» وتبويب «حلول الآخرين».

### 3.4 الدوري الأسبوعي
1. `/league` يعرض: عدّاد نهاية الأسبوع، بطاقات التحديات الخمسة بحالتها، وترتيب الأسبوع (الكل / أصدقائي).
2. كل حلّ جديد يحدّث ترتيبه فورًا.
3. فجر السبت (بتوقيت الجزائر): يُغلق الأسبوع ويُنشَر الملخص ويُمنح الشارات ويبدأ الأسبوع التالي.

### 3.5 الغرف
1. «أنشئ غرفة» ← اسم ← يُولَّد رمز من 6 أحرف (حروف كبيرة وأرقام بلا O وI وL وصفر) ورابط `/rooms/ABC123`.
2. صديق يفتح الرابط ← إن لم يكن مسجلًا يُطلب منه الدخول ثم ينضم تلقائيًا.
3. داخل الغرفة: ترتيب الأسبوع للأعضاء، وتعليقات قصيرة، وزر «تحدَّ صديقًا».
4. **التحدي المباشر:** يختار منشئ التحدي صديقًا وتحديًا ومهلة (24 ساعة افتراضيًا) ← يصل الصديق إشعار داخل التطبيق ← الفائز من يجتاز عددًا أكبر من الاختبارات، وعند التعادل الأسرع زمنًا من لحظة أول فتح.

## 4) مواصفات الصفحات الأساسية

### 4.1 الصفحة الرئيسية
```
┌──────────────────────────────────────────────┐
│ [سَطر]        التحديات  الدوري  الغرف   [دخول]│  ← شريط علوي ثابت 64px
├──────────────────────────────────────────────┤
│  برمج مشاكل حيّك                              │
│  تحديات برمجية من واقعنا، تُصحَّح فورًا،       │
│  وتنافس فيها أصدقاءك كل أسبوع.                │
│  [ابدأ أول تحدٍّ الآن]  [كيف تعمل؟]           │
│  ┌─ محرّر مصغّر ───────────────────────────┐  │
│  │ المسألة المختصرة │ كود │ [شغّل] النتائج  │  │
│  └──────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│ ثلاث بطاقات: تصحيح فوري | دوري الأصدقاء | من واقعك │
│ تحدّي الأسبوع + عدّاد  │ أفضل 5 هذا الأسبوع    │
│ ثلاثة تحديات مميزة │ كيف تبدأ في 3 خطوات      │
│ أسئلة سريعة (3) │ تذييل                        │
└──────────────────────────────────────────────┘
```
على الهاتف: عمود واحد، المحرّر المصغّر تحت العنوان مباشرة، والشريط العلوي يتحول إلى شريط سفلي (5 أيقونات).

### 4.2 صفحة التحدّي
```
سطح المكتب (عمودان 45% / 55%):
┌─ المسألة ────────────┬─ الكود ───────────────────┐
│ عنوان + شارات        │ [JS ▾] [إعادة] [A- A+]     │
│ القصة                │ ┌───────────────────────┐ │
│ المطلوب              │ │   Monaco (LTR)        │ │
│ المدخلات/المخرجات    │ └───────────────────────┘ │
│ أمثلة (ملونة)        │ [شغّل]  [سلّم الحل]        │
│ القيود               │ ── النتائج ──              │
│ [تلميح (مقفل)]       │ ✓ اختبار 1  ✗ اختبار 2…   │
└──────────────────────┴────────────────────────────┘
الهاتف: ثلاثة تبويبات علوية (المسألة | الكود | النتائج) + شريط أزرار سفلي ثابت.
```
**حالات لوحة النتائج:** (أ) فارغة: «اضغط شغّل لتجرّب حلّك»، (ب) جارٍ: شريط تقدّم + «جارٍ فحص الاختبار ٣ من ٦»، (ج) نجاح، (د) فشل جزئي (يعرض المدخل والمتوقع والفعلي للاختبار الظاهر الفاشل)، (هـ) خطأ تنفيذ برسالة عربية، (و) مهلة.

### 4.3 صفحة الدوري
رأس: «دوري هذا الأسبوع» + عدّاد (أيام:ساعات:دقائق:ثوانٍ). بطاقات 5 تحديات (حالة: لم يُحل / محلول + النقاط). تبويبات الترتيب: «الجميع» و«أصدقائي» و«غرفتي». صف المستخدم الحالي مثبّت أسفل الجدول إن كان خارج أول 20. المراكز الثلاثة الأولى بميداليات.

### 4.4 الملف الشخصي
رأس (صورة رمزية، اسم، مستوى، نقاط كلية، سلسلة الأيام الحالية والأطول)، خريطة نشاط 12 أسبوعًا، شارات (المكتسبة ملونة والمقفلة رمادية مع شرط الاكتساب)، تقدّم المسارات، آخر 10 حلول. زر «شارك ملفي» ينشئ صورة OG.

### 4.5 الإعدادات
الملف الشخصي (اسم العرض، النبذة 160 حرفًا)، الخصوصية (ملف عام / للأصدقاء)، السمة (فاتح/داكن/تلقائي)، حجم الخط، اللغة الافتراضية للمحرّر، الهدف الأسبوعي، تصدير البيانات، حذف الحساب (بتأكيد كتابة اسم المستخدم).

## 5) المصحّح الآلي (Grader)

### 5.1 بروتوكول الرسائل بين الصفحة والعامل (Worker)
```ts
// من الصفحة إلى العامل
type RunMsg = { id: string; lang: 'javascript'|'python'; code: string;
  fn: string; tests: { args: unknown[]; expected: unknown; hidden: boolean }[];
  timeoutMs: number /* 3000 لكل اختبار */ };
// من العامل إلى الصفحة (يُرسَل بعد كل اختبار)
type ResMsg = { id: string; index: number; ok: boolean; actual?: unknown;
  error?: { kind: 'syntax'|'missing_fn'|'runtime'|'timeout'|'output_limit'; message: string };
  ms: number } | { id: string; done: true; passed: number; total: number; totalMs: number };
```

### 5.2 خوارزمية التشغيل
1. تُنشأ نسخة عامل جديدة لكل «تسليم» (لعزل الحالة)، وتُنهى بـ `worker.terminate()` عند انتهاء الجميع أو أي مهلة.
2. **JavaScript:** يُحمَّل الكود عبر `new Function` داخل العامل، ويُحذف `fetch` و`XMLHttpRequest` و`importScripts` و`WebSocket` من النطاق قبل التنفيذ. تُستدعى الدالة بـ `structuredClone(args)` لمنع تعديل بيانات الاختبار.
3. **Python (Pyodide):** يُحمَّل مرة واحدة ويُعاد استخدامه بين التشغيلات (مع إعادة تعيين النطاق `globals` لكل اختبار). تُحوَّل المدخلات عبر `pyodide.toPy` والمخرجات عبر `toJs({dict_converter: Object.fromEntries})`.
4. **المهلة:** مؤقّت في الصفحة الرئيسية (لا في العامل) يقتل العامل عند تجاوز المهلة ويعيد إنشاءه للاختبارات المتبقية، ويُسجَّل الاختبار «مهلة».
5. **المقارنة:** مقارنة عميقة (deep equal) تعامل `1` و`1.0` متساويين، وتفرّق بين المصفوفة والقاموس، وتتجاهل ترتيب مفاتيح القواميس فقط.
6. **حدّ الإخراج:** أي `print`/`console.log` يُقتطع عند 10 آلاف حرف ويُعرض في تبويب «المخرجات».
7. **الاختبارات المخفية:** لا يظهر مدخلها ولا المتوقع منها، فقط «اختبار مخفي ✓/✗». ولا تُرسَل للعميل قبل «سلّم الحل» (انظر قسم الأمان).

### 5.3 كتالوج رسائل الخطأ (عربي)
| النوع | الرسالة |
|---|---|
| syntax | «في الكود خطأ في الكتابة (سطر {line}): {msg}. راجع الأقواس والنقطتين.» |
| missing_fn | «لم أجد دالة باسم {fn}. تأكد أنك لم تغيّر اسمها.» |
| runtime | «حدث خطأ أثناء التشغيل: {msg}» |
| timeout | «حلّك استغرق وقتًا طويلًا (أكثر من 3 ثوانٍ). جرّب طريقة أسرع.» |
| output_limit | «طبعتَ مخرجات كثيرة. احذف طباعات الاختبار وأعد المحاولة.» |
| wrong | «اجتزت {p} من {t} اختبارات.» |
| load_fail | «تعذّر تحميل بيئة بايثون. تحقق من اتصالك وأعد المحاولة.» |

## 6) النقاط والترتيب (قواعد دقيقة)

### 6.1 معادلة نقاط الحل
```
base      = 10 (سهل) | 25 (متوسط) | 50 (صعب)
fails     = عدد التسليمات الفاشلة قبل أول نجاح
factor    = 1 − min(0.40, 0.10 × fails) − (0.10 إن استُخدم التلميح)
speed     = 0.20 إن كان المستخدم من أول 3 حلّوا هذا التحدي خلال هذا الأسبوع (دوري فقط)، وإلا 0
points    = round_half_up(base × factor × (1 + speed))
```
**أمثلة:**
- متوسط (25)، محاولتان فاشلتان، بلا تلميح: `25×0.8 = 20`.
- متوسط (25)، محاولة فاشلة واحدة مع تلميح: `25×(1−0.1−0.1)=20`.
- صعب (50)، بلا فشل، من أول ثلاثة: `50×1×1.2 = 60`.
- سهل (10)، 5 محاولات فاشلة مع تلميح: `10×(1−0.4−0.1)=5`.

القاعدة: تُحتسب النقاط **مرة واحدة** لكل تحدٍّ عند أول نجاح. إعادة حلّه لا تمنح نقاطًا. الحد الأدنى للنقاط 1.

### 6.2 الدوري
- التحديات الخمسة: سهل، سهل، متوسط، متوسط، صعب.
- **نقاط الأسبوع** = مجموع نقاط الحلول المنجزة بين بداية الأسبوع ونهايته (مع مكافأة السرعة).
- **كسر التعادل:** (1) عدد التحديات المحلولة تنازليًا، (2) مجموع الزمن حتى كل حلّ تصاعديًا (من أول فتح للتحدي)، (3) مجموع المحاولات تصاعديًا، (4) وقت آخر حلّ تصاعديًا.
- **الأسبوع:** من السبت 00:00 إلى الجمعة 23:59 بتوقيت `Africa/Algiers` (UTC+1 دون تغيير صيفي). الإغلاق والفتح معًا **الجمعة 23:00 UTC**.
- نقاط الدوري تُحتسب فقط من تحديات الأسبوع الحالي.

### 6.3 السلسلة والمستويات
- **السلسلة:** تزداد بيوم واحد إن حلّ تحديًا (أي تحدٍّ ناجح لأول مرة) في يوم تقويمي بتوقيت الجزائر، وتعود إلى 0 إن فات يوم كامل. تُحفظ «أطول سلسلة».
- **المستويات:** مبتدئ 0، متدرّب 100، مبرمج 300، محترف 700، خبير 1500 (نقاط كلية).

### 6.4 مكافحة التلاعب
- لا نقاط لحلول متطابقة حرفيًا مع الحل المنشور في تبويب «حلول الآخرين» خلال 10 دقائق من نشره (تحقق تجزئة).
- حدّ 10 تسليمات/دقيقة، و200 تسليم/يوم.
- الترتيب العام يعتمد فقط الحلول `verified = true` (انظر قسم الأمان).

## 7) قاعدة البيانات (Supabase / PostgreSQL)

```sql
create extension if not exists pgcrypto;
create type level_t as enum ('easy','medium','hard');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  bio text check (char_length(bio) <= 160),
  avatar_color text default '#0F9D76',
  preferred_lang text default 'javascript' check (preferred_lang in ('javascript','python')),
  weekly_goal int default 4,
  is_private boolean default false,
  role text default 'user' check (role in ('user','admin')),
  points int default 0, streak int default 0, best_streak int default 0,
  last_solved_on date, created_at timestamptz default now()
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, topic text not null,
  level level_t not null, points int not null,
  content jsonb not null,           -- story, task, io, constraints, examples, hint, tags, functionName, starter
  tests jsonb not null,             -- [{args, expected, hidden}] — لا تُقرأ من العميل
  is_published boolean default false, created_at timestamptz default now()
);
create view challenges_public as
  select id, slug, title, topic, level, points, content, is_published,
    (select jsonb_agg(t) from jsonb_array_elements(tests) t where (t->>'hidden')::boolean = false) as visible_tests
  from challenges where is_published;

create table tracks (id serial primary key, title text, description text, position int);
create table track_items (track_id int references tracks, challenge_id uuid references challenges, position int, primary key(track_id, challenge_id));

create table submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  challenge_id uuid not null references challenges,
  language text not null, code text not null check (char_length(code) <= 20000),
  passed int not null, total int not null, is_correct boolean not null,
  runtime_ms int, hint_used boolean default false, attempt_no int not null,
  verified boolean default false, week_id int, created_at timestamptz default now()
);
create index on submissions (user_id, challenge_id, created_at);

create table weeks (id serial primary key, starts_at timestamptz not null, ends_at timestamptz not null,
  challenge_ids uuid[] not null, status text default 'scheduled' check (status in ('scheduled','open','closed')));
create table week_scores (week_id int references weeks, user_id uuid references profiles on delete cascade,
  points int default 0, solved int default 0, total_ms bigint default 0, attempts int default 0, last_solved_at timestamptz,
  primary key (week_id, user_id));

create table rooms (id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) <= 40),
  code text unique not null, owner_id uuid references profiles on delete cascade, created_at timestamptz default now());
create table room_members (room_id uuid references rooms on delete cascade, user_id uuid references profiles on delete cascade,
  joined_at timestamptz default now(), primary key (room_id, user_id));
create table room_messages (id uuid primary key default gen_random_uuid(), room_id uuid references rooms on delete cascade,
  user_id uuid references profiles on delete cascade, body text not null check (char_length(body) <= 280), created_at timestamptz default now());
create table duels (id uuid primary key default gen_random_uuid(), room_id uuid references rooms on delete cascade,
  challenge_id uuid references challenges, a_user uuid references profiles, b_user uuid references profiles,
  deadline timestamptz not null, winner uuid references profiles, status text default 'open');
create table badges (id serial primary key, key text unique, title text, description text, icon text);
create table user_badges (user_id uuid references profiles on delete cascade, badge_id int references badges, earned_at timestamptz default now(), primary key (user_id, badge_id));
create table reports (id uuid primary key default gen_random_uuid(), user_id uuid references profiles, target_type text, target_id text, reason text, status text default 'open', created_at timestamptz default now());
create table suggestions (id uuid primary key default gen_random_uuid(), user_id uuid references profiles, title text, story text, created_at timestamptz default now());
create table notifications (id uuid primary key default gen_random_uuid(), user_id uuid references profiles on delete cascade, kind text, payload jsonb, read boolean default false, created_at timestamptz default now());
```

### سياسات RLS (أمثلة إلزامية)
```sql
alter table submissions enable row level security;
create policy sub_own_read on submissions for select using (auth.uid() = user_id);
create policy sub_own_insert on submissions for insert with check (auth.uid() = user_id);
-- حلول الآخرين: لا تُقرأ إلا لمن حلّ التحدي بنجاح
create policy sub_others_read on submissions for select using (
  is_correct and exists (select 1 from submissions s where s.user_id = auth.uid() and s.challenge_id = submissions.challenge_id and s.is_correct));
alter table challenges enable row level security;  -- لا سياسة قراءة: القراءة عبر challenges_public فقط
alter table room_messages enable row level security;
create policy msg_members_read on room_messages for select using (exists (select 1 from room_members m where m.room_id = room_messages.room_id and m.user_id = auth.uid()));
create policy msg_members_write on room_messages for insert with check (auth.uid() = user_id and exists (select 1 from room_members m where m.room_id = room_messages.room_id and m.user_id = auth.uid()));
```
فعّل RLS على **كل** جدول، واكتب لكل جدول سياسات قراءة وكتابة صريحة؛ لا جدول بلا سياسة.

### دالة إغلاق الأسبوع (`finalize_week`)
تُنفَّذ من مهمة مجدولة: (1) تحدد الأسبوع المفتوح وتغلقه وتثبّت `week_scores`، (2) تمنح شارات الأسبوع (الأول، أسرع حل، مثابر)، (3) تُنشئ إشعارًا ملخصًا لكل مشارك، (4) تفتح الأسبوع التالي من جدول `weeks` المسبق. **يجب أن تكون متكررة التنفيذ بلا ضرر** (تعمل مرتين دون أثر مضاعف).

## 8) نقاط التواصل الخادمية (Server Actions / API)

| العملية | الوصف |
|---|---|
| `submitSolution(challengeId, lang, code, clientResult)` | تحفظ المحاولة، وتعيد التحقق خادميًا إن أمكن، وتحسب النقاط والسلسلة والشارات في معاملة واحدة |
| `getHiddenTestsToken(challengeId)` | تعيد الاختبارات المخفية مشفّرة لمرة واحدة عند «سلّم الحل» فقط (مرحلة التصحيح بالمتصفح) |
| `createRoom(name)` / `joinRoom(code)` / `leaveRoom(id)` / `kick(id, userId)` | إدارة الغرف |
| `createDuel(roomId, challengeId, opponentId, hours)` | تحدٍّ مباشر |
| `postMessage(roomId, body)` | تعليق في غرفة |
| `reportContent(type, id, reason)` | بلاغ |
| `exportMyData()` / `deleteMyAccount()` | تصدير وحذف |

## 9) نظام التصميم

### 9.1 المتغيرات (CSS Variables)
```css
:root{
  --bg:#F7F8FA; --surface:#FFFFFF; --text:#0F172A; --muted:#64748B; --border:#E2E8F0;
  --primary:#0F9D76; --primary-ink:#FFFFFF; --accent:#FF6B4A;
  --ok:#16A34A; --err:#DC2626; --warn:#F59E0B;
  --easy:#16A34A; --medium:#D97706; --hard:#E11D48;
  --r-sm:8px; --r-md:12px; --r-lg:16px; --r-xl:24px;
  --shadow:0 1px 2px #0f172a0f,0 8px 24px #0f172a0d;
  --font-ui:'Cairo','IBM Plex Sans Arabic',system-ui,sans-serif; --font-code:'JetBrains Mono',ui-monospace,monospace;
}
[data-theme="dark"]{--bg:#0E1116;--surface:#161B22;--text:#E6EDF3;--muted:#8B98A9;--border:#262D36;--primary:#2DD4A3;--primary-ink:#06251C;--accent:#FF8A6B}
```
المسافات بمضاعفات 4px: 4، 8، 12، 16، 24، 32، 48، 64. أحجام الخط: 12، 14، 16، 18، 22، 28، 40، 56. ارتفاع السطر 1.8 للعربية و1.5 للكود.

### 9.2 المكوّنات (مواصفات)
- **الزر الأساسي:** ارتفاع 44px، حشو 0 20px، خلفية primary، نص primary-ink، زاوية 12px، ظل خفيف. حالات: hover (إضاءة 6%)، active (انكماش 98%)، disabled (شفافية 50%)، loading (دوّار صغير ونص «جارٍ…»). حلقة تركيز 3px بلون primary بشفافية 40%.
- **البطاقة:** surface، حدّ 1px border، زاوية 16px، حشو 20px. بطاقة التحدي: شارة المستوى أعلى اليمين، علامة ✓ عند الحل، شريط ملوّن 4px على الحافة اليمنى بلون المستوى.
- **شارة المستوى:** كبسولة بلون المستوى (خلفية 12% وخط 100%).
- **الجدول:** ترويسة ثابتة، صفوف مخططة بخفّة، أول 3 مراكز بميداليات، صف المستخدم الحالي بخلفية primary بشفافية 8%.
- **المحرّر:** ارتفاع أدنى 360px، سمة تتبع السمة العامة، خط 14px، أرقام الأسطر ظاهرة، ويُجبر `direction: ltr`.
- **الإشعار المنبثق (Toast):** أعلى الشاشة (أو فوق الشريط السفلي على الهاتف)، يختفي بعد 4 ثوانٍ، ويدعم `aria-live="polite"`.
- **هيكل التحميل:** كتل رمادية بنبض خفيف تحاكي شكل المحتوى.

### 9.3 الحركة
مدة 150–220ms وتسارع `cubic-bezier(.2,.8,.2,1)`. احتفال النجاح: 24 قصاصة ملوّنة تسقط 1.2 ثانية. تتوقف الحركات كلها عند `prefers-reduced-motion: reduce`.

### 9.4 الاستجابة
نقاط التحوّل: 480 / 768 / 1024 / 1280. أقل عرض مدعوم 320px. الحد الأدنى لمساحة اللمس 44×44px. الشريط السفلي على الهاتف: الرئيسية، التحديات، الدوري، الغرف، حسابي.

### 9.5 الإتاحة
تباين AA، تنقل كامل بلوحة المفاتيح (Tab/Shift+Tab/Enter/Esc)، `aria-live` لنتائج التصحيح، تسميات `aria-label` للأيقونات، `lang="ar"` و`dir="rtl"` على `html`، وفقرات الكود `dir="ltr"` مع `lang="en"`.

## 10) التحليلات وSEO

**أحداث التحليلات (دون بيانات شخصية):** `challenge_view`، `run_clicked`، `submit_clicked`، `submit_result` (النجاح والزمن)، `hint_opened`، `signup_completed`، `room_created`، `room_joined`، `duel_created`، `week_summary_shared`. الغاية: قياس نسبة من يصل لأول نجاح خلال 3 دقائق، وأكثر التحديات فشلًا.

**الوسوم (عنوان | وصف):**
- الرئيسية: «سَطر — تحديات برمجية بالعربية» | «تعلّم البرمجة بحلّ مسائل من واقعك. تصحيح فوري ودوري أسبوعي مع أصدقائك.»
- تحدٍّ: «{العنوان} — تحدي برمجة | سَطر» | أول 150 حرفًا من القصة.
- الدوري: «دوري الأسبوع — سَطر» | «نافس أصدقاءك في خمسة تحديات جديدة كل أسبوع.»
- الملف الشخصي: «{الاسم} على سَطر» | «{المستوى} — {النقاط} نقطة — سلسلة {الأيام} يومًا.»

استخدم `sitemap.xml` و`robots.txt` وبيانات منظّمة (JSON-LD) لنوع `LearningResource`.

## 11) بنية المجلدات المقترحة
```
sattar/
├─ app/                 # صفحات Next.js (المسارات في القسم 2)
├─ components/          # ui/ (زر، بطاقة…) و challenge/ و league/ و rooms/
├─ lib/                 # supabase.ts, scoring.ts, streak.ts, week.ts, deepEqual.ts
├─ workers/             # js-runner.ts, py-runner.ts
├─ content/             # challenges.json, tracks.json, badges.json
├─ scripts/             # validate-challenges.ts, seed.ts, make-admin.ts
├─ supabase/            # migrations/*.sql, seed.sql
├─ tests/               # unit/, e2e/
└─ public/              # icons, manifest.json
```

## 12) متغيرات البيئة
`NEXT_PUBLIC_SUPABASE_URL`، `NEXT_PUBLIC_SUPABASE_ANON_KEY`، `SUPABASE_SERVICE_ROLE_KEY` (خادم فقط)، `CRON_SECRET`، `NEXT_PUBLIC_SITE_URL`، `SENTRY_DSN` (اختياري)، `ADMIN_EMAIL`.

## 13) ما أطلبه منك عند البناء
1. التزم بهذا الملف حرفيًا؛ وإن وجدت فيه تناقضًا فاذكره قبل البدء واقترح حلًّا.
2. استورد التحديات من `challenges.json` كما هي، ولا تعدّل الاختبارات أو الناتج المتوقع.
3. اكتب لكل تحدٍّ حلًّا مرجعيًا بجافاسكربت يطابق الحل البايثوني المرفق (`reference_python`)، وتحقق أن الاثنين ينجحان في كل الاختبارات.
4. سلّم كل مرحلة بملفات كاملة وتعليمات تشغيل واختبار.