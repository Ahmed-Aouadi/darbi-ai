# النشر

## أ) النشر الأدنى (بلا قاعدة بيانات)
الموقع يعمل كاملًا (التحديات والتشغيل المحلي) بلا أي متغيرات بيئة.

1. ارفع المشروع إلى GitHub.
2. في [Vercel](https://vercel.com): **Add New → Project** واختر المستودع. الإطار يُكتشف تلقائيًا (Next.js).
3. أضف `NEXT_PUBLIC_SITE_URL` بعنوان موقعك، ثم **Deploy**.

## ب) تفعيل تسجيل الدخول والواجهات (Supabase)
1. أنشئ مشروعًا في Supabase وفعّل **Email (magic link)** من Authentication ← Providers.
2. طبّق الهجرات **بالترتيب** من `supabase/migrations/` (0001 ثم 0002 … حتى 0007) عبر SQL Editor أو `supabase db push`.
3. في Authentication ← URL Configuration أضف عنوان موقعك إلى **Site URL** و**Redirect URLs**.
4. في Vercel ← Settings ← Environment Variables أضف:
   - `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (للخادم فقط، **لا** تسبقه بـ `NEXT_PUBLIC_`)
   - `CRON_SECRET` و`ADMIN_EMAIL`
5. أعد النشر. يضيف `middleware.ts` عنوان Supabase تلقائيًا إلى `connect-src` في CSP.
6. أبقِ أعلام الميزات `ff_*` مطفأة حتى تنجح قائمة `docs/wave1/MANUAL-TEST.md`.

## قائمة فحص قبل الإطلاق

- [ ] `npm run check` ينجح محليًا (محتوى، اختبارات، أنواع، ESLint).
- [ ] ادفع `package-lock.json` بعد أول `npm install`.
- [ ] افتح الموقع المنشور وتأكد أن زر «شغّل الأمثلة» يعمل (يختبر `/runner` وCSP في الإنتاج).
- [ ] افتح أدوات المطوّر ← Console: لا أخطاء CSP.
- [ ] جرّب `curl -I https://موقعك/` وتأكد من ظهور `Content-Security-Policy` و`X-Frame-Options: DENY`.
- [ ] جرّب `curl -I https://موقعك/runner` وتأكد أن CSP فيه `connect-src 'none'`.
- [ ] لا مفاتيح سرية في المستودع (`git log -p | grep -i service_role`).
- [ ] راجع نصوص الخصوصية والشروط قانونيًا قبل جمع بيانات مستخدمين حقيقيين.
