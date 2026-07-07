export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      absence_excuses: {
        Row: {
          attendance_record_id: string
          created_at: string
          id: string
          reason: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          school_id: string
          status: Database["public"]["Enums"]["absence_excuse_status"]
          student_id: string
          submitted_at: string
          submitted_by_user_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attendance_record_id: string
          created_at?: string
          id?: string
          reason: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["absence_excuse_status"]
          student_id: string
          submitted_at?: string
          submitted_by_user_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attendance_record_id?: string
          created_at?: string
          id?: string
          reason?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["absence_excuse_status"]
          student_id?: string
          submitted_at?: string
          submitted_by_user_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "absence_excuses_attendance_record_id_fkey"
            columns: ["attendance_record_id"]
            isOneToOne: true
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_excuses_reviewed_by_user_id_fkey"
            columns: ["reviewed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_excuses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_excuses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_excuses_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_excuses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          code: string
          created_at: string
          ends_on: string
          id: string
          is_current: boolean
          name: string
          school_id: string
          starts_on: string
          status: Database["public"]["Enums"]["academic_year_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          ends_on: string
          id?: string
          is_current?: boolean
          name: string
          school_id: string
          starts_on: string
          status?: Database["public"]["Enums"]["academic_year_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          ends_on?: string
          id?: string
          is_current?: boolean
          name?: string
          school_id?: string
          starts_on?: string
          status?: Database["public"]["Enums"]["academic_year_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_years_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          academic_year_id: string
          attendance_session_id: string
          class_enrollment_id: string
          class_id: string
          created_at: string
          id: string
          method: Database["public"]["Enums"]["attendance_record_method"]
          notes: string | null
          recorded_at: string
          recorded_by_user_id: string | null
          school_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          attendance_session_id: string
          class_enrollment_id: string
          class_id: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["attendance_record_method"]
          notes?: string | null
          recorded_at?: string
          recorded_by_user_id?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          attendance_session_id?: string
          class_enrollment_id?: string
          class_id?: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["attendance_record_method"]
          notes?: string | null
          recorded_at?: string
          recorded_by_user_id?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_attendance_session_id_fkey"
            columns: ["attendance_session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_class_enrollment_id_fkey"
            columns: ["class_enrollment_id"]
            isOneToOne: false
            referencedRelation: "class_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_recorded_by_user_id_fkey"
            columns: ["recorded_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          ends_at: string | null
          id: string
          method: Database["public"]["Enums"]["attendance_session_method"]
          notes: string | null
          school_id: string
          session_date: string
          starts_at: string | null
          status: Database["public"]["Enums"]["attendance_session_status"]
          taken_by_user_id: string | null
          tenant_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          ends_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["attendance_session_method"]
          notes?: string | null
          school_id: string
          session_date: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["attendance_session_status"]
          taken_by_user_id?: string | null
          tenant_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["attendance_session_method"]
          notes?: string | null
          school_id?: string
          session_date?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["attendance_session_status"]
          taken_by_user_id?: string | null
          tenant_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_taken_by_user_id_fkey"
            columns: ["taken_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json
          school_id: string | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          school_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          school_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_new_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_new_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_new_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          created_by_user_id: string | null
          enrolled_on: string
          grade_level_id: string
          id: string
          left_on: string | null
          school_id: string
          status: Database["public"]["Enums"]["class_enrollment_status"]
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          created_by_user_id?: string | null
          enrolled_on?: string
          grade_level_id: string
          id?: string
          left_on?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["class_enrollment_status"]
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          created_by_user_id?: string | null
          enrolled_on?: string
          grade_level_id?: string
          id?: string
          left_on?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["class_enrollment_status"]
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string
          capacity: number | null
          created_at: string
          grade_level_id: string
          homeroom_teacher_id: string | null
          id: string
          name: string
          room_name: string | null
          school_id: string
          section: string
          status: Database["public"]["Enums"]["class_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          capacity?: number | null
          created_at?: string
          grade_level_id: string
          homeroom_teacher_id?: string | null
          id?: string
          name: string
          room_name?: string | null
          school_id: string
          section: string
          status?: Database["public"]["Enums"]["class_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          capacity?: number | null
          created_at?: string
          grade_level_id?: string
          homeroom_teacher_id?: string | null
          id?: string
          name?: string
          room_name?: string | null
          school_id?: string
          section?: string
          status?: Database["public"]["Enums"]["class_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_homeroom_teacher_id_fkey"
            columns: ["homeroom_teacher_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          academic_year_id: string
          class_enrollment_id: string
          class_id: string
          created_at: string
          entered_at: string
          entered_by_user_id: string | null
          exam_id: string
          id: string
          notes: string | null
          published_at: string | null
          school_id: string
          score: number | null
          status: Database["public"]["Enums"]["exam_result_status"]
          student_id: string
          subject_id: string
          tenant_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_enrollment_id: string
          class_id: string
          created_at?: string
          entered_at?: string
          entered_by_user_id?: string | null
          exam_id: string
          id?: string
          notes?: string | null
          published_at?: string | null
          school_id: string
          score?: number | null
          status?: Database["public"]["Enums"]["exam_result_status"]
          student_id: string
          subject_id: string
          tenant_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_enrollment_id?: string
          class_id?: string
          created_at?: string
          entered_at?: string
          entered_by_user_id?: string | null
          exam_id?: string
          id?: string
          notes?: string | null
          published_at?: string | null
          school_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["exam_result_status"]
          student_id?: string
          subject_id?: string
          tenant_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_class_enrollment_id_fkey"
            columns: ["class_enrollment_id"]
            isOneToOne: false
            referencedRelation: "class_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_entered_by_user_id_fkey"
            columns: ["entered_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          created_by_user_id: string | null
          exam_date: string | null
          grade_level_id: string
          id: string
          max_score: number
          notes: string | null
          school_id: string
          status: Database["public"]["Enums"]["exam_status"]
          subject_id: string
          tenant_id: string
          term_id: string | null
          title: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          created_by_user_id?: string | null
          exam_date?: string | null
          grade_level_id: string
          id?: string
          max_score?: number
          notes?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["exam_status"]
          subject_id: string
          tenant_id: string
          term_id?: string | null
          title: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          created_by_user_id?: string | null
          exam_date?: string | null
          grade_level_id?: string
          id?: string
          max_score?: number
          notes?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["exam_status"]
          subject_id?: string
          tenant_id?: string
          term_id?: string | null
          title?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_entries: {
        Row: {
          academic_year_id: string
          category: Database["public"]["Enums"]["grade_entry_category"]
          class_enrollment_id: string
          class_id: string
          created_at: string
          entered_by_user_id: string | null
          id: string
          max_score: number
          notes: string | null
          recorded_on: string
          school_id: string
          score: number
          status: Database["public"]["Enums"]["grade_entry_status"]
          student_id: string
          subject_id: string
          tenant_id: string
          term_id: string | null
          title: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          academic_year_id: string
          category?: Database["public"]["Enums"]["grade_entry_category"]
          class_enrollment_id: string
          class_id: string
          created_at?: string
          entered_by_user_id?: string | null
          id?: string
          max_score?: number
          notes?: string | null
          recorded_on?: string
          school_id: string
          score: number
          status?: Database["public"]["Enums"]["grade_entry_status"]
          student_id: string
          subject_id: string
          tenant_id: string
          term_id?: string | null
          title: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          academic_year_id?: string
          category?: Database["public"]["Enums"]["grade_entry_category"]
          class_enrollment_id?: string
          class_id?: string
          created_at?: string
          entered_by_user_id?: string | null
          id?: string
          max_score?: number
          notes?: string | null
          recorded_on?: string
          school_id?: string
          score?: number
          status?: Database["public"]["Enums"]["grade_entry_status"]
          student_id?: string
          subject_id?: string
          tenant_id?: string
          term_id?: string | null
          title?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_entries_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_class_enrollment_id_fkey"
            columns: ["class_enrollment_id"]
            isOneToOne: false
            referencedRelation: "class_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_entered_by_user_id_fkey"
            columns: ["entered_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_entries_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_level_subjects: {
        Row: {
          academic_year_id: string
          created_at: string
          grade_level_id: string
          id: string
          is_required: boolean
          school_id: string
          sort_order: number
          subject_id: string
          tenant_id: string
          updated_at: string
          weekly_periods: number | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          grade_level_id: string
          id?: string
          is_required?: boolean
          school_id: string
          sort_order?: number
          subject_id: string
          tenant_id: string
          updated_at?: string
          weekly_periods?: number | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          grade_level_id?: string
          id?: string
          is_required?: boolean
          school_id?: string
          sort_order?: number
          subject_id?: string
          tenant_id?: string
          updated_at?: string
          weekly_periods?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_level_subjects_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_level_subjects_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_level_subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_level_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_level_subjects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_levels: {
        Row: {
          code: string
          created_at: string
          grade_order: number
          id: string
          name: string
          school_id: string
          stage: Database["public"]["Enums"]["grade_level_stage"]
          status: Database["public"]["Enums"]["grade_level_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          grade_order: number
          id?: string
          name: string
          school_id: string
          stage?: Database["public"]["Enums"]["grade_level_stage"]
          status?: Database["public"]["Enums"]["grade_level_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          grade_order?: number
          id?: string
          name?: string
          school_id?: string
          stage?: Database["public"]["Enums"]["grade_level_stage"]
          status?: Database["public"]["Enums"]["grade_level_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_levels_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_levels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      report_cards: {
        Row: {
          academic_year_id: string
          admin_notes: string | null
          class_enrollment_id: string
          class_id: string
          created_at: string
          generated_at: string
          generated_by_user_id: string | null
          id: string
          published_at: string | null
          school_id: string
          status: Database["public"]["Enums"]["report_card_status"]
          student_id: string
          summary: Json
          teacher_remarks: string | null
          tenant_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          admin_notes?: string | null
          class_enrollment_id: string
          class_id: string
          created_at?: string
          generated_at?: string
          generated_by_user_id?: string | null
          id?: string
          published_at?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["report_card_status"]
          student_id: string
          summary?: Json
          teacher_remarks?: string | null
          tenant_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          admin_notes?: string | null
          class_enrollment_id?: string
          class_id?: string
          created_at?: string
          generated_at?: string
          generated_by_user_id?: string | null
          id?: string
          published_at?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["report_card_status"]
          student_id?: string
          summary?: Json
          teacher_remarks?: string | null
          tenant_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_class_enrollment_id_fkey"
            columns: ["class_enrollment_id"]
            isOneToOne: false
            referencedRelation: "class_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_generated_by_user_id_fkey"
            columns: ["generated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number | null
          code: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          school_id: string
          status: Database["public"]["Enums"]["room_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          school_id: string
          status?: Database["public"]["Enums"]["room_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          school_id?: string
          status?: Database["public"]["Enums"]["room_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          official_name: string | null
          phone: string | null
          slug: string
          status: Database["public"]["Enums"]["school_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          official_name?: string | null
          phone?: string | null
          slug: string
          status?: Database["public"]["Enums"]["school_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          official_name?: string | null
          phone?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["school_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_admissions: {
        Row: {
          birth_date: string | null
          created_at: string
          decision_notes: string | null
          gender: Database["public"]["Enums"]["student_gender"] | null
          guardian_email: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation: Database["public"]["Enums"]["guardian_relation"]
          id: string
          nationality: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          school_id: string
          status: Database["public"]["Enums"]["admission_status"]
          student_first_name: string
          student_full_name: string
          student_last_name: string
          student_middle_name: string | null
          submitted_at: string
          submitted_by_user_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          decision_notes?: string | null
          gender?: Database["public"]["Enums"]["student_gender"] | null
          guardian_email?: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation?: Database["public"]["Enums"]["guardian_relation"]
          id?: string
          nationality?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["admission_status"]
          student_first_name: string
          student_full_name: string
          student_last_name: string
          student_middle_name?: string | null
          submitted_at?: string
          submitted_by_user_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          decision_notes?: string | null
          gender?: Database["public"]["Enums"]["student_gender"] | null
          guardian_email?: string | null
          guardian_name?: string
          guardian_phone?: string
          guardian_relation?: Database["public"]["Enums"]["guardian_relation"]
          id?: string
          nationality?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["admission_status"]
          student_first_name?: string
          student_full_name?: string
          student_last_name?: string
          student_middle_name?: string | null
          submitted_at?: string
          submitted_by_user_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_admissions_reviewed_by_user_id_fkey"
            columns: ["reviewed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_admissions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_admissions_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_admissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          admission_id: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["student_document_type"]
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          school_id: string
          student_id: string | null
          tenant_id: string
          uploaded_by_user_id: string | null
        }
        Insert: {
          admission_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["student_document_type"]
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          school_id: string
          student_id?: string | null
          tenant_id: string
          uploaded_by_user_id?: string | null
        }
        Update: {
          admission_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["student_document_type"]
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          school_id?: string
          student_id?: string | null
          tenant_id?: string
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "student_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          can_receive_notifications: boolean
          created_at: string
          guardian_email: string | null
          guardian_name: string
          guardian_phone: string
          guardian_user_id: string | null
          id: string
          is_primary: boolean
          relation: Database["public"]["Enums"]["guardian_relation"]
          school_id: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          can_receive_notifications?: boolean
          created_at?: string
          guardian_email?: string | null
          guardian_name: string
          guardian_phone: string
          guardian_user_id?: string | null
          id?: string
          is_primary?: boolean
          relation?: Database["public"]["Enums"]["guardian_relation"]
          school_id: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          can_receive_notifications?: boolean
          created_at?: string
          guardian_email?: string | null
          guardian_name?: string
          guardian_phone?: string
          guardian_user_id?: string | null
          id?: string
          is_primary?: boolean
          relation?: Database["public"]["Enums"]["guardian_relation"]
          school_id?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_user_id_fkey"
            columns: ["guardian_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_status_history: {
        Row: {
          changed_by_user_id: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["student_status"] | null
          id: string
          reason: string | null
          school_id: string
          student_id: string
          tenant_id: string
          to_status: Database["public"]["Enums"]["student_status"]
        }
        Insert: {
          changed_by_user_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["student_status"] | null
          id?: string
          reason?: string | null
          school_id: string
          student_id: string
          tenant_id: string
          to_status: Database["public"]["Enums"]["student_status"]
        }
        Update: {
          changed_by_user_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["student_status"] | null
          id?: string
          reason?: string | null
          school_id?: string
          student_id?: string
          tenant_id?: string
          to_status?: Database["public"]["Enums"]["student_status"]
        }
        Relationships: [
          {
            foreignKeyName: "student_status_history_changed_by_user_id_fkey"
            columns: ["changed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_status_history_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_status_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_status_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_id: string | null
          birth_date: string | null
          created_at: string
          enrolled_at: string
          first_name: string
          full_name: string
          gender: Database["public"]["Enums"]["student_gender"] | null
          id: string
          last_name: string
          middle_name: string | null
          nationality: string | null
          photo_url: string | null
          qr_token: string
          school_id: string
          status: Database["public"]["Enums"]["student_status"]
          student_number: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          admission_id?: string | null
          birth_date?: string | null
          created_at?: string
          enrolled_at?: string
          first_name: string
          full_name: string
          gender?: Database["public"]["Enums"]["student_gender"] | null
          id?: string
          last_name: string
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          qr_token?: string
          school_id: string
          status?: Database["public"]["Enums"]["student_status"]
          student_number?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          admission_id?: string | null
          birth_date?: string | null
          created_at?: string
          enrolled_at?: string
          first_name?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["student_gender"] | null
          id?: string
          last_name?: string
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          qr_token?: string
          school_id?: string
          status?: Database["public"]["Enums"]["student_status"]
          student_number?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: true
            referencedRelation: "student_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          school_id: string
          status: Database["public"]["Enums"]["subject_status"]
          subject_type: Database["public"]["Enums"]["subject_type"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          school_id: string
          status?: Database["public"]["Enums"]["subject_status"]
          subject_type?: Database["public"]["Enums"]["subject_type"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          status?: Database["public"]["Enums"]["subject_status"]
          subject_type?: Database["public"]["Enums"]["subject_type"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subject_assignments: {
        Row: {
          academic_year_id: string
          class_id: string | null
          created_at: string
          created_by_user_id: string | null
          grade_level_id: string | null
          id: string
          school_id: string
          status: Database["public"]["Enums"]["teacher_subject_assignment_status"]
          subject_id: string
          teacher_user_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          grade_level_id?: string | null
          id?: string
          school_id: string
          status?: Database["public"]["Enums"]["teacher_subject_assignment_status"]
          subject_id: string
          teacher_user_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          grade_level_id?: string | null
          id?: string
          school_id?: string
          status?: Database["public"]["Enums"]["teacher_subject_assignment_status"]
          subject_id?: string
          teacher_user_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subject_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_teacher_user_id_fkey"
            columns: ["teacher_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          direction: string
          id: string
          locale: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          direction?: string
          id?: string
          locale?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          locale?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Relationships: []
      }
      terms: {
        Row: {
          academic_year_id: string
          code: string
          created_at: string
          ends_on: string
          id: string
          name: string
          school_id: string
          starts_on: string
          status: Database["public"]["Enums"]["term_status"]
          tenant_id: string
          term_order: number
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          code: string
          created_at?: string
          ends_on: string
          id?: string
          name: string
          school_id: string
          starts_on: string
          status?: Database["public"]["Enums"]["term_status"]
          tenant_id: string
          term_order: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          code?: string
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          school_id?: string
          starts_on?: string
          status?: Database["public"]["Enums"]["term_status"]
          tenant_id?: string
          term_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_slots: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          created_by_user_id: string | null
          day_of_week: Database["public"]["Enums"]["timetable_day_of_week"]
          ends_at: string
          grade_level_id: string
          id: string
          notes: string | null
          room_id: string | null
          school_id: string
          starts_at: string
          status: Database["public"]["Enums"]["timetable_slot_status"]
          subject_id: string
          teacher_user_id: string
          tenant_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          created_by_user_id?: string | null
          day_of_week: Database["public"]["Enums"]["timetable_day_of_week"]
          ends_at: string
          grade_level_id: string
          id?: string
          notes?: string | null
          room_id?: string | null
          school_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["timetable_slot_status"]
          subject_id: string
          teacher_user_id: string
          tenant_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          created_by_user_id?: string | null
          day_of_week?: Database["public"]["Enums"]["timetable_day_of_week"]
          ends_at?: string
          grade_level_id?: string
          id?: string
          notes?: string | null
          room_id?: string | null
          school_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["timetable_slot_status"]
          subject_id?: string
          teacher_user_id?: string
          tenant_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_slots_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_teacher_user_id_fkey"
            columns: ["teacher_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_memberships: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          status: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          role: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_direction: string
          preferred_locale: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          full_name: string
          id: string
          phone?: string | null
          preferred_direction?: string
          preferred_locale?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_direction?: string
          preferred_locale?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_admission_and_create_student: {
        Args: {
          p_admission_id: string
          p_changed_by_user_id: string
          p_decision_notes?: string
        }
        Returns: {
          student_id: string
          student_number: string
        }[]
      }
      generate_student_number: { Args: never; Returns: string }
    }
    Enums: {
      absence_excuse_status: "pending" | "approved" | "rejected" | "cancelled"
      academic_year_status: "draft" | "active" | "closed" | "archived"
      admission_status: "pending" | "approved" | "rejected" | "cancelled"
      attendance_record_method: "manual" | "qr" | "system"
      attendance_session_method: "manual" | "qr"
      attendance_session_status: "open" | "closed" | "cancelled"
      attendance_status: "present" | "absent" | "late" | "excused"
      class_enrollment_status:
        | "active"
        | "transferred"
        | "withdrawn"
        | "completed"
        | "archived"
      class_status: "active" | "inactive" | "archived"
      exam_result_status:
        | "draft"
        | "entered"
        | "published"
        | "absent"
        | "excused"
      exam_status:
        | "draft"
        | "scheduled"
        | "completed"
        | "published"
        | "cancelled"
      grade_entry_category:
        | "quiz"
        | "assignment"
        | "homework"
        | "project"
        | "participation"
        | "behavior"
        | "other"
      grade_entry_status: "draft" | "entered" | "published"
      grade_level_stage:
        | "kindergarten"
        | "primary"
        | "middle"
        | "secondary"
        | "other"
      grade_level_status: "active" | "inactive" | "archived"
      guardian_relation: "father" | "mother" | "guardian" | "other"
      membership_status: "active" | "invited" | "suspended" | "archived"
      report_card_status: "draft" | "published" | "archived"
      room_status: "active" | "inactive" | "archived"
      school_status: "active" | "inactive" | "archived"
      student_document_type:
        | "birth_certificate"
        | "national_id"
        | "passport"
        | "medical_report"
        | "previous_school_record"
        | "photo"
        | "other"
      student_gender: "male" | "female"
      student_status:
        | "active"
        | "inactive"
        | "transferred"
        | "withdrawn"
        | "graduated"
        | "archived"
      subject_status: "active" | "inactive" | "archived"
      subject_type: "core" | "elective" | "activity" | "other"
      teacher_subject_assignment_status: "active" | "inactive" | "archived"
      tenant_status: "active" | "inactive" | "suspended"
      term_status: "draft" | "active" | "closed" | "archived"
      timetable_day_of_week:
        | "sunday"
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
      timetable_slot_status: "active" | "cancelled" | "archived"
      user_role:
        | "system_admin"
        | "school_admin"
        | "teacher"
        | "parent"
        | "student"
        | "accountant"
        | "librarian"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      absence_excuse_status: ["pending", "approved", "rejected", "cancelled"],
      academic_year_status: ["draft", "active", "closed", "archived"],
      admission_status: ["pending", "approved", "rejected", "cancelled"],
      attendance_record_method: ["manual", "qr", "system"],
      attendance_session_method: ["manual", "qr"],
      attendance_session_status: ["open", "closed", "cancelled"],
      attendance_status: ["present", "absent", "late", "excused"],
      class_enrollment_status: [
        "active",
        "transferred",
        "withdrawn",
        "completed",
        "archived",
      ],
      class_status: ["active", "inactive", "archived"],
      exam_result_status: [
        "draft",
        "entered",
        "published",
        "absent",
        "excused",
      ],
      exam_status: [
        "draft",
        "scheduled",
        "completed",
        "published",
        "cancelled",
      ],
      grade_entry_category: [
        "quiz",
        "assignment",
        "homework",
        "project",
        "participation",
        "behavior",
        "other",
      ],
      grade_entry_status: ["draft", "entered", "published"],
      grade_level_stage: [
        "kindergarten",
        "primary",
        "middle",
        "secondary",
        "other",
      ],
      grade_level_status: ["active", "inactive", "archived"],
      guardian_relation: ["father", "mother", "guardian", "other"],
      membership_status: ["active", "invited", "suspended", "archived"],
      report_card_status: ["draft", "published", "archived"],
      room_status: ["active", "inactive", "archived"],
      school_status: ["active", "inactive", "archived"],
      student_document_type: [
        "birth_certificate",
        "national_id",
        "passport",
        "medical_report",
        "previous_school_record",
        "photo",
        "other",
      ],
      student_gender: ["male", "female"],
      student_status: [
        "active",
        "inactive",
        "transferred",
        "withdrawn",
        "graduated",
        "archived",
      ],
      subject_status: ["active", "inactive", "archived"],
      subject_type: ["core", "elective", "activity", "other"],
      teacher_subject_assignment_status: ["active", "inactive", "archived"],
      tenant_status: ["active", "inactive", "suspended"],
      term_status: ["draft", "active", "closed", "archived"],
      timetable_day_of_week: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      timetable_slot_status: ["active", "cancelled", "archived"],
      user_role: [
        "system_admin",
        "school_admin",
        "teacher",
        "parent",
        "student",
        "accountant",
        "librarian",
      ],
    },
  },
} as const

