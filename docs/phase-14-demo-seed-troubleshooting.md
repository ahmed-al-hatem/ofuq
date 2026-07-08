# توثيق مشاكل Seed في Phase 14 وحلها

## الهدف

يوثق هذا الملف المشاكل التي ظهرت أثناء إضافة بيانات Phase 14 التجريبية السورية، وكيف تم تحليلها وحلها. الهدف هو منع تكرار نفس أخطاء `supabase db reset` عند إضافة بيانات demo كبيرة أو مترابطة لاحقًا.

المرحلة المعنية:

```text
14 - Syrian Demo Dataset Foundation
```

## السياق

تمت إضافة بيانات محلية تجريبية تغطي أغلب وحدات النظام:

- مستخدمون من كل الأدوار الثابتة.
- Tenant ومدرسة سورية تجريبية.
- صفوف من الأول حتى الثالث الثانوي.
- شعب، مواد، تسجيلات طلاب.
- حضور، أعذار غياب، درجات، شهادات.
- جدول حصص، مالية، رسائل، مكتبة، رعاية طلابية، شكاوى واستبيانات.
- كل المستخدمين المحليين يستخدمون بريدًا ينتهي بـ `@ofuq.local`.
- كلمة المرور المحلية الموحدة:
  ```text
  OfuqLocal123!
  ```

## المشكلة الأولى: جداول Temporary داخل Seed

كانت النسخة الأولى من ملف demo seed تعتمد على جداول مؤقتة مثل:

```sql
create temporary table temp_demo_context ...
create temporary table temp_demo_users ...
create temporary table temp_demo_student_discounts ...
```

ثم تستخدم هذه الجداول لاحقًا داخل نفس ملف seed.

أثناء التشغيل ظهر الخطأ:

```text
failed to send batch: ERROR: relation "temp_demo_student_discounts" does not exist (SQLSTATE 42P01)
```

ثم ظهرت أخطاء مشابهة مثل:

```text
failed to send batch: ERROR: relation "temp_demo_context" does not exist (SQLSTATE 42P01)
```

## السبب

اعتماد ملف seed كبير على `temporary tables` غير آمن مع طريقة Supabase CLI في إرسال ملفات seed على شكل batches. قد لا تبقى الجداول المؤقتة مرئية عند تنفيذ أو تخطيط statements لاحقة، خصوصًا عندما يكون الملف طويلًا وفيه إنشاء ثم استخدام لاحق داخل نفس الملف.

## المحاولة الثانية: تحويل الجداول إلى Public Staging Tables داخل ملف واحد

تم تحويل الجداول من:

```sql
create temporary table temp_demo_users ...
```

إلى:

```sql
drop table if exists public.temp_demo_users;
create table public.temp_demo_users ...
```

مع إضافة:

```sql
set search_path = public, auth, extensions;
```

لكن بقيت المشكلة تظهر بأسماء أخرى، مثل:

```text
failed to send batch: ERROR: relation "public.temp_demo_book_copies" does not exist (SQLSTATE 42P01)
```

## السبب

المشكلة لم تكن فقط في كون الجداول temporary. المشكلة الأعمق أن الملف كان ينشئ relation ثم يستخدمها لاحقًا داخل نفس seed file. مع batch execution قد تفشل بعض العلاقات وقت التخطيط حتى لو كان أمر الإنشاء ظاهرًا قبل الاستخدام نصيًا.

## المحاولة الثالثة: تقسيم Seed إلى 4 ملفات

تم تقسيم seed إلى:

```text
local_syrian_demo_00_helpers.sql
local_syrian_demo_01_stage.sql
local_syrian_demo_02_apply.sql
local_syrian_demo_03_cleanup.sql
```

لكن ملف `01_stage.sql` كان ما زال ينشئ staging tables ويستخدمها داخل نفس الملف لإدخال البيانات، فظهر الخطأ:

```text
Seeding data from supabase/seeds/local_syrian_demo_01_stage.sql...
failed to send batch: ERROR: relation "public.temp_demo_users" does not exist (SQLSTATE 42P01)
```

## السبب النهائي

حتى داخل ملف stage نفسه، لا يجب الاعتماد على إنشاء جدول ثم استخدامه لاحقًا داخل نفس ملف seed إذا كان الملف كبيرًا أو يُرسل كدفعة واحدة.

القاعدة العملية التي اعتمدناها:

```text
لا تنشئ relation وتستخدمها داخل نفس seed file.
```

## الحل النهائي المعتمد: تقسيم Seed إلى 5 ملفات

تم اعتماد تقسيم واضح إلى خمس مراحل:

```text
local_syrian_demo_00_helpers.sql
local_syrian_demo_01_create_stage_tables.sql
local_syrian_demo_02_stage_data.sql
local_syrian_demo_03_apply.sql
local_syrian_demo_04_cleanup.sql
```

### 00 Helpers

ينشئ الدوال المساعدة فقط، مثل deterministic UUID helper:

```sql
public.demo_seed_uuid(seed text)
```

### 01 Create Stage Tables

ينشئ جداول staging فقط، دون إدخال أو استخدام بيانات:

```sql
create table public.temp_demo_users (...);
create table public.temp_demo_students (...);
create table public.temp_demo_invoices (...);
```

### 02 Stage Data

يدخل البيانات الخام داخل جداول staging فقط:

```sql
insert into public.temp_demo_users ...
insert into public.temp_demo_students ...
insert into public.temp_demo_invoices ...
```

### 03 Apply

ينقل البيانات من جداول staging إلى جداول النظام الفعلية:

```sql
insert into auth.users ...
insert into public.user_profiles ...
insert into public.students ...
insert into public.invoices ...
```

### 04 Cleanup

يحذف جداول staging والدوال المساعدة:

```sql
drop table if exists public.temp_demo_users, public.temp_demo_students, ...;
drop function if exists public.demo_seed_uuid(text);
```

## ترتيب Seed النهائي في `supabase/config.toml`

يجب أن يكون الترتيب كالتالي:

```toml
[db.seed]
enabled = true
sql_paths = [
  "./seed.sql",
  "./seeds/local_syrian_demo_00_helpers.sql",
  "./seeds/local_syrian_demo_01_create_stage_tables.sql",
  "./seeds/local_syrian_demo_02_stage_data.sql",
  "./seeds/local_syrian_demo_03_apply.sql",
  "./seeds/local_syrian_demo_04_cleanup.sql",
  "./seeds/auth_smoke_token_defaults.sql"
]
```

## ملفات يجب ألا تبقى داخل `sql_paths`

لا تضع أيًا من الملفات التالية في `sql_paths` بعد اعتماد الحل النهائي:

```text
./seeds/local_syrian_demo_data.sql
./seeds/local_syrian_demo_01_stage.sql
./seeds/local_syrian_demo_02_apply.sql
./seeds/local_syrian_demo_03_cleanup.sql
```

يمكن حذفها من المستودع إذا كانت أضيفت أثناء المحاولات السابقة.

## قاعدة Auth Token Safety

يجب أن يبقى الملف التالي آخر seed file دائمًا:

```text
./seeds/auth_smoke_token_defaults.sql
```

والسبب أنه يعالج مستخدمي Supabase Auth المحليين بعد إنشاء جميع حسابات `@ofuq.local`.

يجب أن يستهدف كل المستخدمين المحليين:

```sql
where email like '%@ofuq.local'
```

الهدف منع تكرار مشكلة قيم `NULL` في حقول token داخل `auth.users`.

## فحص Token NULL من PowerShell

بعد نجاح `supabase db reset`، يمكن تنفيذ الفحص عبر Docker:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1

docker exec -i $dbContainer psql -U postgres -d postgres -c "
select count(*) as users_with_null_token_fields
from auth.users
where email like '%@ofuq.local'
  and (
    confirmation_token is null
    or recovery_token is null
    or email_change_token_new is null
    or email_change_token_current is null
    or email_change is null
    or phone_change_token is null
    or phone_change is null
    or reauthentication_token is null
  );
"
```

المتوقع:

```text
0
```

## فحص حسابات Demo

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1

docker exec -i $dbContainer psql -U postgres -d postgres -c "
select email, email_confirmed_at
from auth.users
where email like '%@ofuq.local'
order by email;
"
```

## أوامر التحقق قبل Commit

لا يتم عمل commit قبل نجاح الأوامر التالية:

```powershell
supabase db reset
npm run lint
npm run build
git -c safe.directory=D:/ofuq/ofuq diff --check
```

ويفضل أيضًا تنفيذ spot checks على عدد السجلات الأساسية:

```powershell
$dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db*" } | Select-Object -First 1

docker exec -i $dbContainer psql -U postgres -d postgres -c "
select 'user_profiles' as table_name, count(*) from public.user_profiles
union all select 'user_memberships', count(*) from public.user_memberships
union all select 'grade_levels', count(*) from public.grade_levels
union all select 'classes', count(*) from public.classes
union all select 'subjects', count(*) from public.subjects
union all select 'students', count(*) from public.students
union all select 'student_guardians', count(*) from public.student_guardians
union all select 'class_enrollments', count(*) from public.class_enrollments
union all select 'attendance_sessions', count(*) from public.attendance_sessions
union all select 'attendance_records', count(*) from public.attendance_records
union all select 'exams', count(*) from public.exams
union all select 'exam_results', count(*) from public.exam_results
union all select 'timetable_slots', count(*) from public.timetable_slots
union all select 'invoices', count(*) from public.invoices
union all select 'payments', count(*) from public.payments
union all select 'messages', count(*) from public.messages
union all select 'book_loans', count(*) from public.book_loans
union all select 'health_records', count(*) from public.health_records
union all select 'complaints', count(*) from public.complaints
union all select 'surveys', count(*) from public.surveys
union all select 'survey_responses', count(*) from public.survey_responses;
"
```

## Troubleshooting سريع

### إذا ظهر خطأ `relation public.temp_demo_* does not exist`

افحص ترتيب الملفات:

```powershell
Select-String -Path "supabase/config.toml" -Pattern "local_syrian_demo|auth_smoke"
```

يجب أن يكون الترتيب:

```text
00_helpers
01_create_stage_tables
02_stage_data
03_apply
04_cleanup
auth_smoke_token_defaults
```

### إذا ظهر الخطأ داخل `01_create_stage_tables.sql`

غالبًا يوجد statement يستخدم staging table داخل ملف الإنشاء. هذا الملف يجب أن يحتوي create/drop فقط.

### إذا ظهر الخطأ داخل `02_stage_data.sql`

تأكد أن `01_create_stage_tables.sql` موجود في `sql_paths` قبله، وأن أسماء الجداول متطابقة.

### إذا ظهر الخطأ داخل `03_apply.sql`

تأكد أن `02_stage_data.sql` نفذ قبله، وأن `04_cleanup.sql` لم يوضع قبل apply.

### إذا ظهر Token NULL count أكبر من 0

تأكد أن:

```text
auth_smoke_token_defaults.sql
```

آخر ملف في `sql_paths`، وأن شرطه يشمل:

```sql
where email like '%@ofuq.local'
```

## قواعد مستقبلية لأي Demo Seed كبير

1. لا تستخدم `temporary tables` داخل Supabase seed كبير.
2. لا تنشئ relation وتستخدمها داخل نفس seed file.
3. افصل seed إلى:
   - helpers
   - create staging tables
   - insert staging data
   - apply into real tables
   - cleanup
   - auth safety pass
4. اجعل أسماء جداول staging واضحة ومؤهلة:
   ```sql
   public.temp_demo_*
   ```
5. لا تترك staging tables بدون cleanup.
6. لا تضع `auth_smoke_token_defaults.sql` إلا في آخر الترتيب.
7. لا تبدأ مرحلة tests قبل نجاح `supabase db reset` وSQL checks.
8. لا تعمل commit قبل اكتمال التحقق.
