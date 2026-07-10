# Demo Readiness

## Purpose

هذه الوثيقة تجمع مسار العرض النهائي لـ Ofuq بحيث يمكن تقديم النظام أمام لجنة المناقشة دون ارتجال، مع توضيح حسابات العرض، المسارات الأساسية، ونقاط الحديث المقترحة.

## Recommended Demo Order

1. الصفحة العامة `/` ثم صفحة تسجيل الدخول `/login`.
2. الدخول بحساب `school_admin` وعرض `/dashboard`.
3. الانتقال إلى الطلاب ثم المسار الأكاديمي.
4. عرض جلسات الحضور ثم الاختبارات والدرجات.
5. عرض المالية ثم المكتبة ثم الإعلانات.
6. عرض الإعدادات ثم التكاملات بوصفها إعدادات MVP محلية.
7. تسجيل الدخول بحساب `parent` أو `student` وعرض `/portal`.
8. إنهاء العرض بملخص النطاق الحالي والقيود المعروفة وفرص التطوير.

## Demo Users

المصدر المعتمد: `docs/supabase-local.md`, `tests/e2e/helpers/auth.ts`, `supabase/seeds/local_syrian_demo_02_stage_data.sql`, `supabase/seeds/local_syrian_demo_03_apply.sql`.

جميع الحسابات المحلية ذات النطاق `@ofuq.local` تستخدم كلمة المرور `OfuqLocal123!` وفق `docs/supabase-local.md`، مع أولوية متغير البيئة `E2E_PASSWORD` في اختبارات المتصفح.

| Role | Email | Password | Start Route | What to show |
| --- | --- | --- | --- | --- |
| `school_admin` | `school.admin@ofuq.local` | `OfuqLocal123!` | `/dashboard` | لوحة تشغيل المدرسة، الطلاب، الأكاديمي، الحضور، الدرجات، المالية، المكتبة، الإعلانات، الإعدادات، التكاملات |
| `teacher` | `teacher.arabic@ofuq.local` | `OfuqLocal123!` | `/dashboard` | لوحة المعلم، الحضور، الدرجات، الجدول، والتواصل مع إظهار تصفية التنقل بحسب الدور |
| `accountant` | `accountant@ofuq.local` | `OfuqLocal123!` | `/dashboard` | لوحة المحاسب، المالية، الفواتير، الدفعات، والتقارير المالية |
| `librarian` | `librarian@ofuq.local` | `OfuqLocal123!` | `/dashboard` | لوحة المكتبة، الفهرس، النسخ، الإعارات والمتأخرات |
| `parent` | `parent.hassan@ofuq.local` | `OfuqLocal123!` | `/portal` | بوابة متابعة الأبناء، الحضور، الدرجات، المالية، الإعلانات، والتأكيد أن البوابة قراءة فقط |
| `student` | `student.youssef@ofuq.local` | `OfuqLocal123!` | `/portal` | بوابة الطالب، بياناتي، الدرجات، الجدول، المكتبة، والإعلانات مع بقاء البوابة قراءة فقط |

## Presentation Route Map

| Route | Status | Presentation use |
| --- | --- | --- |
| `/` | موجود | مدخل العرض والهوية العامة |
| `/login` | موجود | تسجيل الدخول بحسابات الديمو |
| `/dashboard` | موجود | البداية الإدارية والدخول إلى اللوحات حسب الدور |
| `/dashboard/students` | موجود | عرض ملفات الطلاب |
| `/dashboard/academic` | موجود | نقطة العرض الأكاديمية المباشرة |
| `/dashboard/attendance/sessions` | موجود | جلسات الحضور اليدوية وQR |
| `/dashboard/grades/exams` | موجود | الاختبارات والنتائج |
| `/dashboard/finance` | موجود | الملخص المالي والفواتير |
| `/dashboard/library` | موجود | ملخص المكتبة وروابط الإعارة |
| `/dashboard/communication/announcements` | موجود | الإعلانات المدرسية |
| `/dashboard/settings` | موجود | إعدادات المدرسة ضمن النسخة الحالية |
| `/dashboard/integrations` | موجود | إعدادات التكاملات المحلية ضمن MVP |
| `/portal` | موجود | الصفحة الرئيسية لولي الأمر أو الطالب |
| `/portal/students` | موجود | الأبناء أو بياناتي |
| `/portal/attendance` | موجود | متابعة الحضور قراءة فقط |
| `/portal/grades` | موجود | النتائج ومدخلات الدرجات وبطاقات التقييم |
| `/portal/finance` | موجود | ملخص مالي للأسرة أو عرض محدود للطالب |
| `/portal/library` | موجود | الإعارات الحالية والسجل المقروء |
| `/portal/announcements` | موجود | الإعلانات والفعاليات المناسبة |
| `/portal/profile` | موجود | الملف الشخصي وعضوية المدرسة |

## Live Demo Script

### 1. Entry and login

- افتح `/` وعرّف Ofuq كنظام إدارة مدارس عربي متعدد المدارس.
- انتقل إلى `/login`.
- سجّل الدخول بحساب `school.admin@ofuq.local`.

### 2. School admin overview

- اعرض `/dashboard`.
- اشرح أن المحتوى والتنقل يتغيران بحسب الدور مع بقاء التحقق والصلاحيات على الخادم.
- أشر إلى أن البيانات المعروضة محلية ومتصلة بسياق مدرسة فعلية في بيئة العرض.

### 3. Students and academic structure

- افتح `/dashboard/students` لعرض السجلات الأساسية.
- افتح `/dashboard/academic` ثم انتقل عند الحاجة إلى السنوات أو الشعب أو المواد.
- أكّد أن الهيكل الأكاديمي هو أساس الحضور والدرجات والجداول.

### 4. Attendance and grades

- افتح `/dashboard/attendance/sessions` لعرض جلسات الحضور.
- افتح `/dashboard/grades/exams` لعرض الاختبارات والنتائج.
- عند الحاجة، أشر إلى أن بطاقة التقييم والمسار الأكاديمي يعتمدان على نفس البيانات المدرسية.

### 5. Operational modules

- افتح `/dashboard/finance` ثم أظهر الفواتير والدفعات.
- افتح `/dashboard/library` ثم أظهر الفهرس والإعارات.
- افتح `/dashboard/communication/announcements` لعرض الإعلانات المدرسية.

### 6. Settings and integrations

- افتح `/dashboard/settings`.
- افتح `/dashboard/integrations`.
- اشرح أن التكاملات الخارجية معروضة كإعدادات واجهة ضمن نطاق MVP من دون اتصال فعلي.

### 7. Parent or student portal

- سجّل الخروج ثم سجّل الدخول بحساب `parent.hassan@ofuq.local` أو `student.youssef@ofuq.local`.
- افتح `/portal`.
- انتقل إلى الطلاب أو بياناتي، ثم الحضور، الدرجات، المالية، المكتبة، والإعلانات.
- أكّد بوضوح أن البوابة مخصصة للعرض والقراءة فقط في النسخة الحالية.

### 8. Closing note

- لخّص أن النسخة الحالية تغطي الأساس الإداري، الأكاديمي، المالي، والمكتبي مع بوابة متابعة مقروءة.
- اختم بالقيود المعروفة وفرص التطوير التالية دون توسيع النطاق في العرض.

## What To Show By Role

| Role | Start route | Suggested talking points |
| --- | --- | --- |
| `school_admin` | `/dashboard` | شمولية اللوحة، الطلاب، الأكاديمي، الحضور، الدرجات، المالية، المكتبة، الإعدادات، التكاملات |
| `teacher` | `/dashboard` | لوحة المعلم، تصفية التنقل بحسب الدور، الحضور، الدرجات، الجدول |
| `accountant` | `/dashboard` | لوحة المحاسب، الفواتير، الدفعات، الرصيد المستحق، التقارير |
| `librarian` | `/dashboard` | لوحة المكتبة، فهرس الكتب، النسخ، الإعارات والمتأخرات |
| `parent` | `/portal` | متابعة الأبناء، الحضور، الدرجات، المالية، الإعلانات مع قراءة فقط |
| `student` | `/portal` | البيانات الشخصية، الدرجات، الجدول، المكتبة، الإعلانات مع قراءة فقط |

## Known Limitations

- التكاملات الخارجية معروضة كإعدادات واجهة ضمن نطاق MVP من دون OAuth أو مزامنة أو اتصال فعلي.
- الذكاء الاصطناعي وواجهة الاستعلام الذكي مؤجلان إلى مرحلة لاحقة بعد توفر بيانات تشغيلية كافية.
- بوابة ولي الأمر والطالب مخصصة للعرض والقراءة فقط في هذه النسخة المحلية.
- الدفع الإلكتروني غير مفعّل في النسخة المحلية، وتبقى الدفعات المعروضة يدوية.
- إنشاء PDF للتقارير أو الإيصالات ليس جزءًا من مسار العرض الحالي.
- RLS مؤجل في هذه النسخة، ويعتمد العزل الحالي على طبقة الخدمات والتحقق الخادمي وسياق العضوية النشطة.

## Final Smoke Checklist

- [ ] تشغيل البيئة المحلية المطلوبة قبل العرض.
- [ ] فتح `/` والتأكد من وضوح الهوية العامة.
- [ ] تسجيل الدخول بحساب `school.admin@ofuq.local`.
- [ ] فتح `/dashboard`.
- [ ] فتح `/dashboard/students`.
- [ ] فتح `/dashboard/academic`.
- [ ] فتح `/dashboard/attendance/sessions` أو `/dashboard/grades/exams`.
- [ ] فتح `/dashboard/finance`.
- [ ] فتح `/dashboard/library`.
- [ ] فتح `/dashboard/communication/announcements`.
- [ ] فتح `/dashboard/settings`.
- [ ] فتح `/dashboard/integrations`.
- [ ] تسجيل الخروج ثم تسجيل الدخول بحساب `parent.hassan@ofuq.local` أو `student.youssef@ofuq.local`.
- [ ] فتح `/portal`.
- [ ] التأكد أن روابط لوحة الإدارة غير ظاهرة داخل البوابة.
- [ ] التأكد أن صفحات البوابة تبقى قراءة فقط.

## Local Environment Assumptions

- المشروع يعمل محليًا على بيئة Next.js داخل هذا المستودع.
- بيانات الديمو المحلية مزروعة عبر تسلسل البذور الموثق في `docs/supabase-local.md`.
- حسابات `@ofuq.local` مفعّلة محليًا ومربوطة ببيانات المدرسة التجريبية.
- كلمة المرور المحلية المشتركة هي `OfuqLocal123!` ما لم يتم تجاوزها عبر `E2E_PASSWORD`.
- إن تعذر مسار المتصفح المحلي، تبقى أوامر البناء والفحص النصي هي الحد الأدنى الإلزامي قبل العرض.

## Intentionally Out Of Scope For The MVP

- المدفوعات الإلكترونية الحقيقية أو بوابات الدفع.
- تكاملات WhatsApp وMoE وCalendar وBI وAutomation الفعلية.
- AI Query أو Chatbot أو منشئ تقارير بالسحب والإفلات.
- توسيع صلاحيات RBAC أو تطبيق RLS كامل في هذه المرحلة.
- أي بوابة ذات عمليات كتابة لولي الأمر أو الطالب.

## Skills Used

- `shadcn`: used for final Card/Button/Badge/Table/Page layout polish where touched
- `ui-ux-pro-max`: used for demo flow clarity, presentation readiness, copy polish, and Arabic RTL consistency
- `migrate-radix-to-base`: not needed because no Radix imports were found
