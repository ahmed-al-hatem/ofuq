set search_path = public, auth, extensions;

drop table if exists public.temp_demo_context;
create table public.temp_demo_context (
  tenant_id uuid not null,
  school_id uuid not null,
  academic_year_id uuid not null,
  term_1_id uuid not null,
  term_2_id uuid not null,
  seed_created_at timestamptz not null,
  seed_updated_at timestamptz not null
);

drop table if exists public.temp_demo_users;
create table public.temp_demo_users (

  email text primary key,
  user_id uuid not null,
  membership_id uuid not null,
  role public.user_role not null,
  full_name text not null,
  display_name text not null,
  phone text

);

drop table if exists public.temp_demo_grade_levels;
create table public.temp_demo_grade_levels (

  grade_level_id uuid primary key,
  code text not null,
  name text not null,
  grade_order integer not null,
  stage public.grade_level_stage not null

);

drop table if exists public.temp_demo_classes;
create table public.temp_demo_classes (

  class_id uuid primary key,
  grade_code text not null,
  section text not null,
  name text not null,
  capacity integer,
  homeroom_email text not null,
  room_name text

);

drop table if exists public.temp_demo_subjects;
create table public.temp_demo_subjects (

  subject_id uuid primary key,
  code text not null,
  name text not null,
  description text,
  subject_type public.subject_type not null

);

drop table if exists public.temp_demo_grade_subjects;
create table public.temp_demo_grade_subjects (
  grade_level_subject_id uuid primary key,
  grade_code text not null,
  subject_code text not null,
  sort_order integer not null,
  weekly_periods integer not null
);

drop table if exists public.temp_demo_guardians;
create table public.temp_demo_guardians (

  guardian_key text primary key,
  guardian_name text not null,
  guardian_email text not null,
  guardian_phone text not null,
  relation public.guardian_relation not null,
  guardian_user_email text

);

drop table if exists public.temp_demo_admissions;
create table public.temp_demo_admissions (

  admission_key text primary key,
  admission_id uuid not null,
  student_first_name text not null,
  student_middle_name text,
  student_last_name text not null,
  student_full_name text not null,
  gender public.student_gender,
  birth_date date,
  nationality text,
  guardian_name text not null,
  guardian_email text,
  guardian_phone text not null,
  guardian_relation public.guardian_relation not null,
  status public.admission_status not null,
  submitted_by_email text,
  reviewed_by_email text,
  notes text,
  decision_notes text,
  submitted_at timestamptz not null,
  reviewed_at timestamptz

);

drop table if exists public.temp_demo_students;
create table public.temp_demo_students (

  student_id uuid primary key,
  student_number text not null,
  qr_token uuid not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  full_name text not null,
  gender public.student_gender,
  birth_date date,
  nationality text,
  grade_code text not null,
  section text not null,
  guardian_key text not null,
  admission_key text,
  enrolled_at date not null

);

drop table if exists public.temp_demo_rooms;
create table public.temp_demo_rooms (

  room_id uuid primary key,
  room_key text not null,
  name text not null,
  code text not null,
  capacity integer,
  location text

);

drop table if exists public.temp_demo_timetable_assignments;
create table public.temp_demo_timetable_assignments (

  assignment_id uuid primary key,
  grade_code text not null,
  subject_code text not null,
  teacher_email text not null,
  created_by_email text not null

);

drop table if exists public.temp_demo_timetable_slots;
create table public.temp_demo_timetable_slots (

  slot_id uuid primary key,
  class_key text not null,
  grade_code text not null,
  subject_code text not null,
  teacher_email text not null,
  room_key text not null,
  day_of_week public.timetable_day_of_week not null,
  starts_at time not null,
  ends_at time not null,
  notes text

);

drop table if exists public.temp_demo_fee_structures;
create table public.temp_demo_fee_structures (

  fee_structure_id uuid primary key,
  fee_structure_key text not null,
  grade_code text not null,
  name text not null,
  description text

);

drop table if exists public.temp_demo_fee_items;
create table public.temp_demo_fee_items (

  fee_item_id uuid primary key,
  fee_structure_key text not null,
  name text not null,
  item_type public.fee_item_type not null,
  amount numeric(12,2) not null,
  due_date date,
  sort_order integer not null

);

drop table if exists public.temp_demo_discount_types;
create table public.temp_demo_discount_types (

  discount_type_id uuid primary key,
  discount_key text not null,
  name text not null,
  description text,
  value_type public.discount_value_type not null,
  value numeric(12,2) not null

);

drop table if exists public.temp_demo_student_discounts;
create table public.temp_demo_student_discounts (

  student_discount_id uuid primary key,
  student_number text not null,
  discount_key text not null,
  starts_on date,
  ends_on date,
  status public.student_discount_status not null,
  notes text

);

drop table if exists public.temp_demo_invoices;
create table public.temp_demo_invoices (

  invoice_id uuid primary key,
  invoice_number text not null,
  student_number text not null,
  issue_date date not null,
  due_date date,
  subtotal_amount numeric(12,2) not null,
  discount_amount numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null,
  balance_amount numeric(12,2) not null,
  status public.invoice_status not null,
  notes text,
  issued_at timestamptz,
  created_by_email text not null,
  issued_by_email text

);

drop table if exists public.temp_demo_invoice_items;
create table public.temp_demo_invoice_items (

  invoice_item_id uuid primary key,
  invoice_number text not null,
  fee_item_id uuid,
  description text not null,
  quantity numeric(10,2) not null,
  unit_amount numeric(12,2) not null,
  discount_amount numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  sort_order integer not null

);

drop table if exists public.temp_demo_payments;
create table public.temp_demo_payments (

  payment_id uuid primary key,
  invoice_number text not null,
  student_number text not null,
  amount numeric(12,2) not null,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null,
  paid_at timestamptz not null,
  reference_number text,
  receipt_number text not null,
  received_by_email text not null,
  notes text

);

drop table if exists public.temp_demo_messages;
create table public.temp_demo_messages (

  message_id uuid primary key,
  message_key text not null,
  sender_email text not null,
  subject text not null,
  body text not null,
  related_student_number text,
  status public.communication_message_status not null,
  sent_at timestamptz not null

);

drop table if exists public.temp_demo_message_recipients;
create table public.temp_demo_message_recipients (

  recipient_row_id uuid primary key,
  message_key text not null,
  recipient_email text not null,
  read_at timestamptz,
  archived_at timestamptz

);

drop table if exists public.temp_demo_announcements;
create table public.temp_demo_announcements (

  announcement_id uuid primary key,
  title text not null,
  body text not null,
  target_type public.announcement_target_type not null,
  target_role public.user_role,
  grade_code text,
  class_key text,
  status public.announcement_status not null,
  published_at timestamptz,
  expires_at timestamptz,
  created_by_email text not null

);

drop table if exists public.temp_demo_notification_logs;
create table public.temp_demo_notification_logs (

  notification_id uuid primary key,
  recipient_email text,
  actor_email text,
  notification_type text not null,
  title text not null,
  body text,
  status public.notification_status not null,
  related_entity_type text,
  related_entity_key text,
  read_at timestamptz

);

drop table if exists public.temp_demo_school_events;
create table public.temp_demo_school_events (

  event_id uuid primary key,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  target_type public.school_event_target_type not null,
  grade_code text,
  class_key text,
  status public.school_event_status not null,
  created_by_email text not null

);

drop table if exists public.temp_demo_book_catalog;
create table public.temp_demo_book_catalog (

  catalog_id uuid primary key,
  catalog_key text not null,
  isbn text,
  title text not null,
  author text,
  publisher text,
  publication_year integer,
  category text,
  language text,
  description text

);

drop table if exists public.temp_demo_book_copies;
create table public.temp_demo_book_copies (

  copy_id uuid primary key,
  copy_key text not null,
  catalog_key text not null,
  barcode text,
  accession_number text,
  shelf_location text,
  condition public.book_copy_condition not null,
  status public.book_copy_status not null,
  notes text

);

drop table if exists public.temp_demo_book_loans;
create table public.temp_demo_book_loans (

  loan_id uuid primary key,
  loan_key text not null,
  copy_key text not null,
  catalog_key text not null,
  student_number text not null,
  issued_by_email text not null,
  returned_by_email text,
  borrowed_at timestamptz not null,
  due_at timestamptz not null,
  returned_at timestamptz,
  status public.book_loan_status not null,
  notes text,
  return_notes text

);

drop table if exists public.temp_demo_health_records;
create table public.temp_demo_health_records (

  health_record_id uuid primary key,
  student_number text not null,
  blood_type text,
  allergies text,
  chronic_conditions text,
  medications text,
  emergency_notes text,
  doctor_name text,
  doctor_phone text,
  status public.health_record_status not null,
  created_by_email text not null,
  updated_by_email text not null

);

drop table if exists public.temp_demo_vaccinations;
create table public.temp_demo_vaccinations (

  vaccination_id uuid primary key,
  student_number text not null,
  vaccine_name text not null,
  dose_label text,
  vaccinated_on date,
  next_due_on date,
  status public.vaccination_status not null,
  notes text,
  recorded_by_email text not null

);

drop table if exists public.temp_demo_clinic_visits;
create table public.temp_demo_clinic_visits (

  clinic_visit_id uuid primary key,
  student_number text not null,
  visited_at timestamptz not null,
  reason text not null,
  symptoms text,
  action_taken text,
  returned_to_class boolean not null,
  guardian_contacted boolean not null,
  referred_to_external_care boolean not null,
  handled_by_email text not null,
  status public.clinic_visit_status not null,
  notes text,
  closed_at timestamptz

);

drop table if exists public.temp_demo_discipline_records;
create table public.temp_demo_discipline_records (

  discipline_record_id uuid primary key,
  student_number text not null,
  incident_date date not null,
  incident_type public.discipline_incident_type not null,
  severity public.discipline_severity not null,
  title text not null,
  description text not null,
  action_taken text,
  status public.discipline_status not null,
  reported_by_email text not null,
  reviewed_by_email text,
  reviewed_at timestamptz

);

drop table if exists public.temp_demo_achievements;
create table public.temp_demo_achievements (

  achievement_id uuid primary key,
  student_number text not null,
  achievement_date date not null,
  title text not null,
  description text,
  category public.achievement_category not null,
  level public.achievement_level not null,
  awarded_by_email text,
  status public.achievement_status not null,
  created_by_email text not null,
  published_at timestamptz

);

drop table if exists public.temp_demo_complaints;
create table public.temp_demo_complaints (

  complaint_id uuid primary key,
  complaint_key text not null,
  submitted_by_email text not null,
  student_number text,
  assigned_to_email text,
  category public.complaint_category not null,
  priority public.complaint_priority not null,
  title text not null,
  description text not null,
  status public.complaint_status not null,
  submitted_at timestamptz not null,
  resolved_at timestamptz,
  resolved_by_email text,
  resolution_summary text

);

drop table if exists public.temp_demo_complaint_updates;
create table public.temp_demo_complaint_updates (

  complaint_update_id uuid primary key,
  complaint_key text not null,
  author_email text not null,
  update_type public.complaint_update_type not null,
  body text not null,
  old_status public.complaint_status,
  new_status public.complaint_status

);

drop table if exists public.temp_demo_surveys;
create table public.temp_demo_surveys (

  survey_id uuid primary key,
  survey_key text not null,
  title text not null,
  description text,
  target_type public.survey_target_type not null,
  target_role public.user_role,
  grade_code text,
  class_key text,
  status public.survey_status not null,
  opens_at timestamptz,
  closes_at timestamptz,
  created_by_email text not null,
  published_at timestamptz,
  closed_at timestamptz

);

drop table if exists public.temp_demo_survey_questions;
create table public.temp_demo_survey_questions (

  question_id uuid primary key,
  survey_key text not null,
  question_key text not null,
  question_text text not null,
  question_type public.survey_question_type not null,
  options jsonb,
  is_required boolean not null,
  sort_order integer not null

);

drop table if exists public.temp_demo_survey_responses;
create table public.temp_demo_survey_responses (

  survey_response_id uuid primary key,
  survey_key text not null,
  respondent_email text not null,
  student_number text,
  answer_q1 text not null,
  answer_q2 text not null,
  submitted_at timestamptz not null

);

drop table if exists public.temp_demo_attendance_sessions;
create table public.temp_demo_attendance_sessions (

  attendance_session_id uuid primary key,
  session_key text not null,
  class_key text not null,
  taken_by_email text not null,
  session_date date not null,
  starts_at time,
  ends_at time,
  method public.attendance_session_method not null,
  status public.attendance_session_status not null,
  notes text

);

drop table if exists public.temp_demo_attendance_records;
create table public.temp_demo_attendance_records (

  attendance_record_id uuid primary key,
  session_key text not null,
  student_number text not null,
  status public.attendance_status not null,
  method public.attendance_record_method not null,
  recorded_by_email text,
  recorded_at timestamptz not null,
  notes text

);

drop table if exists public.temp_demo_absence_excuses;
create table public.temp_demo_absence_excuses (

  absence_excuse_id uuid primary key,
  attendance_record_id uuid not null,
  student_number text not null,
  submitted_by_email text,
  reviewed_by_email text,
  status public.absence_excuse_status not null,
  reason text not null,
  review_notes text,
  submitted_at timestamptz not null,
  reviewed_at timestamptz

);

drop table if exists public.temp_demo_exams;
create table public.temp_demo_exams (

  exam_id uuid primary key,
  exam_key text not null,
  class_key text not null,
  grade_code text not null,
  subject_code text not null,
  title text not null,
  exam_date date,
  max_score numeric(6,2) not null,
  weight numeric(5,2),
  status public.exam_status not null,
  created_by_email text not null,
  notes text

);

drop table if exists public.temp_demo_exam_results;
create table public.temp_demo_exam_results (

  exam_result_id uuid primary key,
  exam_key text not null,
  student_number text not null,
  score numeric(6,2),
  status public.exam_result_status not null,
  entered_by_email text,
  entered_at timestamptz not null,
  published_at timestamptz,
  notes text

);

drop table if exists public.temp_demo_grade_entries;
create table public.temp_demo_grade_entries (

  grade_entry_id uuid primary key,
  class_key text not null,
  subject_code text not null,
  student_number text not null,
  category public.grade_entry_category not null,
  title text not null,
  score numeric(6,2) not null,
  max_score numeric(6,2) not null,
  weight numeric(5,2),
  status public.grade_entry_status not null,
  recorded_on date not null,
  entered_by_email text,
  notes text

);

drop table if exists public.temp_demo_report_cards;
create table public.temp_demo_report_cards (

  report_card_id uuid primary key,
  class_key text not null,
  student_number text not null,
  teacher_remarks text,
  admin_notes text,
  generated_by_email text not null,
  status public.report_card_status not null,
  generated_at timestamptz not null,
  published_at timestamptz

);
