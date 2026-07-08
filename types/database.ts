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
      achievements: {
        Row: {
          achievement_date: string
          awarded_by_user_id: string | null
          category: Database["public"]["Enums"]["achievement_category"]
          created_at: string
          created_by_user_id: string
          description: string | null
          id: string
          level: Database["public"]["Enums"]["achievement_level"]
          published_at: string | null
          school_id: string
          status: Database["public"]["Enums"]["achievement_status"]
          student_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          achievement_date: string
          awarded_by_user_id?: string | null
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          created_by_user_id: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["achievement_level"]
          published_at?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["achievement_status"]
          student_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          achievement_date?: string
          awarded_by_user_id?: string | null
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["achievement_level"]
          published_at?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["achievement_status"]
          student_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_awarded_by_user_id_fkey"
            columns: ["awarded_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string
          class_id: string | null
          created_at: string
          created_by_user_id: string
          expires_at: string | null
          grade_level_id: string | null
          id: string
          published_at: string | null
          school_id: string
          status: Database["public"]["Enums"]["announcement_status"]
          target_role: Database["public"]["Enums"]["user_role"] | null
          target_type: Database["public"]["Enums"]["announcement_target_type"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          class_id?: string | null
          created_at?: string
          created_by_user_id: string
          expires_at?: string | null
          grade_level_id?: string | null
          id?: string
          published_at?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["announcement_status"]
          target_role?: Database["public"]["Enums"]["user_role"] | null
          target_type?: Database["public"]["Enums"]["announcement_target_type"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          class_id?: string | null
          created_at?: string
          created_by_user_id?: string
          expires_at?: string | null
          grade_level_id?: string | null
          id?: string
          published_at?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["announcement_status"]
          target_role?: Database["public"]["Enums"]["user_role"] | null
          target_type?: Database["public"]["Enums"]["announcement_target_type"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_tenant_id_fkey"
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
      book_catalog: {
        Row: {
          author: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          isbn: string | null
          language: string | null
          publication_year: number | null
          publisher: string | null
          school_id: string
          status: Database["public"]["Enums"]["book_catalog_status"]
          subtitle: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          publication_year?: number | null
          publisher?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["book_catalog_status"]
          subtitle?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          publication_year?: number | null
          publisher?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["book_catalog_status"]
          subtitle?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_catalog_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_catalog_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      book_copies: {
        Row: {
          accession_number: string | null
          barcode: string | null
          catalog_id: string
          condition: Database["public"]["Enums"]["book_copy_condition"]
          created_at: string
          created_by_user_id: string | null
          id: string
          notes: string | null
          school_id: string
          shelf_location: string | null
          status: Database["public"]["Enums"]["book_copy_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accession_number?: string | null
          barcode?: string | null
          catalog_id: string
          condition?: Database["public"]["Enums"]["book_copy_condition"]
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          notes?: string | null
          school_id: string
          shelf_location?: string | null
          status?: Database["public"]["Enums"]["book_copy_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accession_number?: string | null
          barcode?: string | null
          catalog_id?: string
          condition?: Database["public"]["Enums"]["book_copy_condition"]
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          notes?: string | null
          school_id?: string
          shelf_location?: string | null
          status?: Database["public"]["Enums"]["book_copy_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_copies_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "book_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_copies_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_copies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_copies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      book_loans: {
        Row: {
          borrowed_at: string
          catalog_id: string
          copy_id: string
          created_at: string
          due_at: string
          id: string
          issued_by_user_id: string
          notes: string | null
          return_notes: string | null
          returned_at: string | null
          returned_by_user_id: string | null
          school_id: string
          status: Database["public"]["Enums"]["book_loan_status"]
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          borrowed_at?: string
          catalog_id: string
          copy_id: string
          created_at?: string
          due_at: string
          id?: string
          issued_by_user_id: string
          notes?: string | null
          return_notes?: string | null
          returned_at?: string | null
          returned_by_user_id?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["book_loan_status"]
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          borrowed_at?: string
          catalog_id?: string
          copy_id?: string
          created_at?: string
          due_at?: string
          id?: string
          issued_by_user_id?: string
          notes?: string | null
          return_notes?: string | null
          returned_at?: string | null
          returned_by_user_id?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["book_loan_status"]
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_loans_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "book_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_loans_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "book_copies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_loans_issued_by_user_id_fkey"
            columns: ["issued_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_loans_returned_by_user_id_fkey"
            columns: ["returned_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_loans_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_loans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_loans_tenant_id_fkey"
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
      clinic_visits: {
        Row: {
          action_taken: string | null
          closed_at: string | null
          created_at: string
          guardian_contacted: boolean
          handled_by_user_id: string | null
          id: string
          notes: string | null
          reason: string
          referred_to_external_care: boolean
          returned_to_class: boolean
          school_id: string
          status: Database["public"]["Enums"]["clinic_visit_status"]
          student_id: string
          symptoms: string | null
          tenant_id: string
          updated_at: string
          visited_at: string
        }
        Insert: {
          action_taken?: string | null
          closed_at?: string | null
          created_at?: string
          guardian_contacted?: boolean
          handled_by_user_id?: string | null
          id?: string
          notes?: string | null
          reason: string
          referred_to_external_care?: boolean
          returned_to_class?: boolean
          school_id: string
          status?: Database["public"]["Enums"]["clinic_visit_status"]
          student_id: string
          symptoms?: string | null
          tenant_id: string
          updated_at?: string
          visited_at?: string
        }
        Update: {
          action_taken?: string | null
          closed_at?: string | null
          created_at?: string
          guardian_contacted?: boolean
          handled_by_user_id?: string | null
          id?: string
          notes?: string | null
          reason?: string
          referred_to_external_care?: boolean
          returned_to_class?: boolean
          school_id?: string
          status?: Database["public"]["Enums"]["clinic_visit_status"]
          student_id?: string
          symptoms?: string | null
          tenant_id?: string
          updated_at?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_visits_handled_by_user_id_fkey"
            columns: ["handled_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visits_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_updates: {
        Row: {
          author_user_id: string
          body: string
          complaint_id: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["complaint_status"] | null
          old_status: Database["public"]["Enums"]["complaint_status"] | null
          school_id: string
          tenant_id: string
          update_type: Database["public"]["Enums"]["complaint_update_type"]
          updated_at: string
        }
        Insert: {
          author_user_id: string
          body: string
          complaint_id: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["complaint_status"] | null
          old_status?: Database["public"]["Enums"]["complaint_status"] | null
          school_id: string
          tenant_id: string
          update_type?: Database["public"]["Enums"]["complaint_update_type"]
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          body?: string
          complaint_id?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["complaint_status"] | null
          old_status?: Database["public"]["Enums"]["complaint_status"] | null
          school_id?: string
          tenant_id?: string
          update_type?: Database["public"]["Enums"]["complaint_update_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_updates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_updates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to_user_id: string | null
          category: Database["public"]["Enums"]["complaint_category"]
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolution_summary: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          school_id: string
          status: Database["public"]["Enums"]["complaint_status"]
          student_id: string | null
          submitted_at: string
          submitted_by_user_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id?: string | null
          submitted_at?: string
          submitted_by_user_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id?: string | null
          submitted_at?: string
          submitted_by_user_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_resolved_by_user_id_fkey"
            columns: ["resolved_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      discipline_records: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string
          id: string
          incident_date: string
          incident_type: Database["public"]["Enums"]["discipline_incident_type"]
          reported_by_user_id: string
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          school_id: string
          severity: Database["public"]["Enums"]["discipline_severity"]
          status: Database["public"]["Enums"]["discipline_status"]
          student_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description: string
          id?: string
          incident_date: string
          incident_type?: Database["public"]["Enums"]["discipline_incident_type"]
          reported_by_user_id: string
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_id: string
          severity?: Database["public"]["Enums"]["discipline_severity"]
          status?: Database["public"]["Enums"]["discipline_status"]
          student_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string
          id?: string
          incident_date?: string
          incident_type?: Database["public"]["Enums"]["discipline_incident_type"]
          reported_by_user_id?: string
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          school_id?: string
          severity?: Database["public"]["Enums"]["discipline_severity"]
          status?: Database["public"]["Enums"]["discipline_status"]
          student_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discipline_records_reported_by_user_id_fkey"
            columns: ["reported_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_records_reviewed_by_user_id_fkey"
            columns: ["reviewed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_types: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          status: Database["public"]["Enums"]["discount_status"]
          tenant_id: string
          updated_at: string
          value: number
          value_type: Database["public"]["Enums"]["discount_value_type"]
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          status?: Database["public"]["Enums"]["discount_status"]
          tenant_id: string
          updated_at?: string
          value: number
          value_type: Database["public"]["Enums"]["discount_value_type"]
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          status?: Database["public"]["Enums"]["discount_status"]
          tenant_id?: string
          updated_at?: string
          value?: number
          value_type?: Database["public"]["Enums"]["discount_value_type"]
        }
        Relationships: [
          {
            foreignKeyName: "discount_types_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_types_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_types_tenant_id_fkey"
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
      fee_items: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          fee_structure_id: string
          id: string
          item_type: Database["public"]["Enums"]["fee_item_type"]
          name: string
          school_id: string
          sort_order: number
          status: Database["public"]["Enums"]["fee_item_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          fee_structure_id: string
          id?: string
          item_type?: Database["public"]["Enums"]["fee_item_type"]
          name: string
          school_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["fee_item_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          fee_structure_id?: string
          id?: string
          item_type?: Database["public"]["Enums"]["fee_item_type"]
          name?: string
          school_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["fee_item_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_items_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string
          class_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency_code: string
          description: string | null
          grade_level_id: string | null
          id: string
          name: string
          school_id: string
          status: Database["public"]["Enums"]["fee_structure_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency_code?: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          name: string
          school_id: string
          status?: Database["public"]["Enums"]["fee_structure_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency_code?: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          name?: string
          school_id?: string
          status?: Database["public"]["Enums"]["fee_structure_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      health_records: {
        Row: {
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string
          created_by_user_id: string | null
          doctor_name: string | null
          doctor_phone: string | null
          emergency_notes: string | null
          id: string
          medications: string | null
          school_id: string
          status: Database["public"]["Enums"]["health_record_status"]
          student_id: string
          tenant_id: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          created_by_user_id?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_notes?: string | null
          id?: string
          medications?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["health_record_status"]
          student_id: string
          tenant_id: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          created_by_user_id?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_notes?: string | null
          id?: string
          medications?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["health_record_status"]
          student_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          created_at: string
          display_name: string
          enabled: boolean
          id: string
          last_checked_at: string | null
          provider: Database["public"]["Enums"]["integration_provider"]
          school_id: string
          settings: Json
          status: Database["public"]["Enums"]["integration_status"]
          tenant_id: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          enabled?: boolean
          id?: string
          last_checked_at?: string | null
          provider: Database["public"]["Enums"]["integration_provider"]
          school_id: string
          settings?: Json
          status?: Database["public"]["Enums"]["integration_status"]
          tenant_id: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          enabled?: boolean
          id?: string
          last_checked_at?: string | null
          provider?: Database["public"]["Enums"]["integration_provider"]
          school_id?: string
          settings?: Json
          status?: Database["public"]["Enums"]["integration_status"]
          tenant_id?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_settings_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_amount: number
          fee_item_id: string | null
          id: string
          invoice_id: string
          quantity: number
          school_id: string
          sort_order: number
          tenant_id: string
          total_amount: number
          unit_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_amount?: number
          fee_item_id?: string | null
          id?: string
          invoice_id: string
          quantity?: number
          school_id: string
          sort_order?: number
          tenant_id: string
          total_amount?: number
          unit_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_amount?: number
          fee_item_id?: string | null
          id?: string
          invoice_id?: string
          quantity?: number
          school_id?: string
          sort_order?: number
          tenant_id?: string
          total_amount?: number
          unit_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_fee_item_id_fkey"
            columns: ["fee_item_id"]
            isOneToOne: false
            referencedRelation: "fee_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year_id: string
          balance_amount: number
          class_enrollment_id: string | null
          created_at: string
          created_by_user_id: string | null
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          issued_at: string | null
          issued_by_user_id: string | null
          notes: string | null
          paid_amount: number
          school_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          subtotal_amount: number
          tenant_id: string
          term_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          balance_amount?: number
          class_enrollment_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          issued_at?: string | null
          issued_by_user_id?: string | null
          notes?: string | null
          paid_amount?: number
          school_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          subtotal_amount?: number
          tenant_id: string
          term_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          balance_amount?: number
          class_enrollment_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          issued_at?: string | null
          issued_by_user_id?: string | null
          notes?: string | null
          paid_amount?: number
          school_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id?: string
          subtotal_amount?: number
          tenant_id?: string
          term_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_class_enrollment_id_fkey"
            columns: ["class_enrollment_id"]
            isOneToOne: false
            referencedRelation: "class_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_issued_by_user_id_fkey"
            columns: ["issued_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          message_id: string
          read_at: string | null
          recipient_user_id: string
          school_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          message_id: string
          read_at?: string | null
          recipient_user_id: string
          school_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string | null
          recipient_user_id?: string
          school_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["message_template_channel"]
          created_at: string
          id: string
          school_id: string
          status: Database["public"]["Enums"]["message_template_status"]
          template_key: string
          tenant_id: string
          title: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["message_template_channel"]
          created_at?: string
          id?: string
          school_id: string
          status?: Database["public"]["Enums"]["message_template_status"]
          template_key: string
          tenant_id: string
          title: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["message_template_channel"]
          created_at?: string
          id?: string
          school_id?: string
          status?: Database["public"]["Enums"]["message_template_status"]
          template_key?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          related_student_id: string | null
          school_id: string
          sender_user_id: string
          sent_at: string
          status: Database["public"]["Enums"]["communication_message_status"]
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          related_student_id?: string | null
          school_id: string
          sender_user_id: string
          sent_at?: string
          status?: Database["public"]["Enums"]["communication_message_status"]
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          related_student_id?: string | null
          school_id?: string
          sender_user_id?: string
          sent_at?: string
          status?: Database["public"]["Enums"]["communication_message_status"]
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_related_student_id_fkey"
            columns: ["related_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          actor_user_id: string | null
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          notification_type: string
          read_at: string | null
          recipient_user_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          school_id: string
          status: Database["public"]["Enums"]["notification_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actor_user_id?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          notification_type: string
          read_at?: string | null
          recipient_user_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["notification_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          actor_user_id?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          notification_type?: string
          read_at?: string | null
          recipient_user_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["notification_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          paid_at: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          receipt_number: string
          received_by_user_id: string | null
          reference_number: string | null
          school_id: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          receipt_number: string
          received_by_user_id?: string | null
          reference_number?: string | null
          school_id: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          receipt_number?: string
          received_by_user_id?: string | null
          reference_number?: string | null
          school_id?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_user_id_fkey"
            columns: ["received_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
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
      school_events: {
        Row: {
          class_id: string | null
          created_at: string
          created_by_user_id: string
          description: string | null
          ends_at: string
          grade_level_id: string | null
          id: string
          location: string | null
          school_id: string
          starts_at: string
          status: Database["public"]["Enums"]["school_event_status"]
          target_type: Database["public"]["Enums"]["school_event_target_type"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by_user_id: string
          description?: string | null
          ends_at: string
          grade_level_id?: string | null
          id?: string
          location?: string | null
          school_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["school_event_status"]
          target_type?: Database["public"]["Enums"]["school_event_target_type"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          ends_at?: string
          grade_level_id?: string | null
          id?: string
          location?: string | null
          school_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["school_event_status"]
          target_type?: Database["public"]["Enums"]["school_event_target_type"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_events_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_events_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      school_settings: {
        Row: {
          academic_week_start: number
          branding: Json
          created_at: string
          direction: string
          id: string
          locale: string
          module_flags: Json
          school_display_name: string | null
          school_id: string
          tenant_id: string
          timezone: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          academic_week_start?: number
          branding?: Json
          created_at?: string
          direction?: string
          id?: string
          locale?: string
          module_flags?: Json
          school_display_name?: string | null
          school_id: string
          tenant_id: string
          timezone?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          academic_week_start?: number
          branding?: Json
          created_at?: string
          direction?: string
          id?: string
          locale?: string
          module_flags?: Json
          school_display_name?: string | null
          school_id?: string
          tenant_id?: string
          timezone?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_settings_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      student_discounts: {
        Row: {
          academic_year_id: string
          created_at: string
          created_by_user_id: string | null
          discount_type_id: string
          ends_on: string | null
          id: string
          notes: string | null
          school_id: string
          starts_on: string | null
          status: Database["public"]["Enums"]["student_discount_status"]
          student_id: string
          tenant_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          created_by_user_id?: string | null
          discount_type_id: string
          ends_on?: string | null
          id?: string
          notes?: string | null
          school_id: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["student_discount_status"]
          student_id: string
          tenant_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          created_by_user_id?: string | null
          discount_type_id?: string
          ends_on?: string | null
          id?: string
          notes?: string | null
          school_id?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["student_discount_status"]
          student_id?: string
          tenant_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_discounts_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_discount_type_id_fkey"
            columns: ["discount_type_id"]
            isOneToOne: false
            referencedRelation: "discount_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_discounts_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
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
          student_user_id: string | null
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
          student_user_id?: string | null
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
          student_user_id?: string | null
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
            foreignKeyName: "students_student_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      survey_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          options: Json | null
          question_text: string
          question_type: Database["public"]["Enums"]["survey_question_type"]
          school_id: string
          sort_order: number
          survey_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          question_text: string
          question_type?: Database["public"]["Enums"]["survey_question_type"]
          school_id: string
          sort_order?: number
          survey_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["survey_question_type"]
          school_id?: string
          sort_order?: number
          survey_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answers: Json
          created_at: string
          id: string
          respondent_user_id: string
          school_id: string
          student_id: string | null
          submitted_at: string
          survey_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          respondent_user_id: string
          school_id: string
          student_id?: string | null
          submitted_at?: string
          survey_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          respondent_user_id?: string
          school_id?: string
          student_id?: string | null
          submitted_at?: string
          survey_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_respondent_user_id_fkey"
            columns: ["respondent_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          class_id: string | null
          closed_at: string | null
          closes_at: string | null
          created_at: string
          created_by_user_id: string
          description: string | null
          grade_level_id: string | null
          id: string
          opens_at: string | null
          published_at: string | null
          school_id: string
          status: Database["public"]["Enums"]["survey_status"]
          target_role: Database["public"]["Enums"]["user_role"] | null
          target_type: Database["public"]["Enums"]["survey_target_type"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          closed_at?: string | null
          closes_at?: string | null
          created_at?: string
          created_by_user_id: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          opens_at?: string | null
          published_at?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["survey_status"]
          target_role?: Database["public"]["Enums"]["user_role"] | null
          target_type?: Database["public"]["Enums"]["survey_target_type"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          closed_at?: string | null
          closes_at?: string | null
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          opens_at?: string | null
          published_at?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["survey_status"]
          target_role?: Database["public"]["Enums"]["user_role"] | null
          target_type?: Database["public"]["Enums"]["survey_target_type"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_tenant_id_fkey"
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
      vaccinations: {
        Row: {
          created_at: string
          dose_label: string | null
          id: string
          next_due_on: string | null
          notes: string | null
          recorded_by_user_id: string | null
          school_id: string
          status: Database["public"]["Enums"]["vaccination_status"]
          student_id: string
          tenant_id: string
          updated_at: string
          vaccinated_on: string | null
          vaccine_name: string
        }
        Insert: {
          created_at?: string
          dose_label?: string | null
          id?: string
          next_due_on?: string | null
          notes?: string | null
          recorded_by_user_id?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["vaccination_status"]
          student_id: string
          tenant_id: string
          updated_at?: string
          vaccinated_on?: string | null
          vaccine_name: string
        }
        Update: {
          created_at?: string
          dose_label?: string | null
          id?: string
          next_due_on?: string | null
          notes?: string | null
          recorded_by_user_id?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["vaccination_status"]
          student_id?: string
          tenant_id?: string
          updated_at?: string
          vaccinated_on?: string | null
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_recorded_by_user_id_fkey"
            columns: ["recorded_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      achievement_category:
        | "academic"
        | "sports"
        | "arts"
        | "behavior"
        | "attendance"
        | "community"
        | "competition"
        | "other"
      achievement_level:
        | "class"
        | "school"
        | "district"
        | "regional"
        | "national"
        | "international"
      achievement_status: "draft" | "published" | "archived"
      admission_status: "pending" | "approved" | "rejected" | "cancelled"
      announcement_status: "draft" | "published" | "archived"
      announcement_target_type: "school" | "role" | "grade_level" | "class"
      attendance_record_method: "manual" | "qr" | "system"
      attendance_session_method: "manual" | "qr"
      attendance_session_status: "open" | "closed" | "cancelled"
      attendance_status: "present" | "absent" | "late" | "excused"
      book_catalog_status: "active" | "inactive" | "archived"
      book_copy_condition: "new" | "good" | "fair" | "poor" | "damaged"
      book_copy_status:
        | "available"
        | "loaned"
        | "reserved"
        | "lost"
        | "damaged"
        | "archived"
      book_loan_status: "active" | "returned" | "overdue" | "lost" | "cancelled"
      class_enrollment_status:
        | "active"
        | "transferred"
        | "withdrawn"
        | "completed"
        | "archived"
      class_status: "active" | "inactive" | "archived"
      clinic_visit_status: "open" | "closed" | "referred" | "cancelled"
      communication_message_status: "sent" | "archived"
      complaint_category:
        | "academic"
        | "behavior"
        | "finance"
        | "transport"
        | "facility"
        | "communication"
        | "staff"
        | "other"
      complaint_priority: "low" | "medium" | "high" | "urgent"
      complaint_status:
        | "submitted"
        | "in_review"
        | "resolved"
        | "rejected"
        | "cancelled"
      complaint_update_type:
        | "comment"
        | "status_change"
        | "assignment"
        | "resolution"
        | "internal_note"
      discipline_incident_type:
        | "behavior"
        | "attendance"
        | "uniform"
        | "bullying"
        | "damage"
        | "academic_misconduct"
        | "other"
      discipline_severity: "low" | "medium" | "high" | "critical"
      discipline_status:
        | "draft"
        | "submitted"
        | "reviewed"
        | "resolved"
        | "cancelled"
      discount_status: "active" | "inactive" | "archived"
      discount_value_type: "percentage" | "fixed_amount"
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
      fee_item_status: "active" | "inactive" | "archived"
      fee_item_type:
        | "tuition"
        | "registration"
        | "transport"
        | "books"
        | "uniform"
        | "activity"
        | "exam"
        | "other"
      fee_structure_status: "active" | "inactive" | "archived"
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
      health_record_status: "active" | "archived"
      integration_provider:
        | "whatsapp"
        | "webhooks"
        | "moe"
        | "google_calendar"
        | "microsoft_calendar"
        | "power_bi"
        | "looker"
        | "zapier"
        | "make"
      integration_status: "placeholder" | "disabled" | "configured" | "error"
      invoice_status:
        | "draft"
        | "issued"
        | "partially_paid"
        | "paid"
        | "cancelled"
        | "void"
      membership_status: "active" | "invited" | "suspended" | "archived"
      message_template_channel: "in_app" | "email" | "sms" | "whatsapp"
      message_template_status: "draft" | "active" | "archived"
      notification_channel: "in_app"
      notification_status: "created" | "read" | "archived" | "failed"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "card"
        | "cheque"
        | "online"
        | "other"
      payment_status:
        | "pending"
        | "completed"
        | "cancelled"
        | "failed"
        | "refunded"
      report_card_status: "draft" | "published" | "archived"
      room_status: "active" | "inactive" | "archived"
      school_event_status: "scheduled" | "cancelled" | "completed" | "archived"
      school_event_target_type: "school" | "grade_level" | "class"
      school_status: "active" | "inactive" | "archived"
      student_discount_status: "active" | "inactive" | "expired" | "cancelled"
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
      survey_question_type:
        | "short_text"
        | "long_text"
        | "single_choice"
        | "multiple_choice"
        | "rating"
        | "yes_no"
      survey_status: "draft" | "published" | "closed" | "archived"
      survey_target_type: "school" | "role" | "grade_level" | "class"
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
      vaccination_status:
        | "scheduled"
        | "completed"
        | "missed"
        | "exempted"
        | "unknown"
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
      achievement_category: [
        "academic",
        "sports",
        "arts",
        "behavior",
        "attendance",
        "community",
        "competition",
        "other",
      ],
      achievement_level: [
        "class",
        "school",
        "district",
        "regional",
        "national",
        "international",
      ],
      achievement_status: ["draft", "published", "archived"],
      admission_status: ["pending", "approved", "rejected", "cancelled"],
      announcement_status: ["draft", "published", "archived"],
      announcement_target_type: ["school", "role", "grade_level", "class"],
      attendance_record_method: ["manual", "qr", "system"],
      attendance_session_method: ["manual", "qr"],
      attendance_session_status: ["open", "closed", "cancelled"],
      attendance_status: ["present", "absent", "late", "excused"],
      book_catalog_status: ["active", "inactive", "archived"],
      book_copy_condition: ["new", "good", "fair", "poor", "damaged"],
      book_copy_status: [
        "available",
        "loaned",
        "reserved",
        "lost",
        "damaged",
        "archived",
      ],
      book_loan_status: ["active", "returned", "overdue", "lost", "cancelled"],
      class_enrollment_status: [
        "active",
        "transferred",
        "withdrawn",
        "completed",
        "archived",
      ],
      class_status: ["active", "inactive", "archived"],
      clinic_visit_status: ["open", "closed", "referred", "cancelled"],
      communication_message_status: ["sent", "archived"],
      complaint_category: [
        "academic",
        "behavior",
        "finance",
        "transport",
        "facility",
        "communication",
        "staff",
        "other",
      ],
      complaint_priority: ["low", "medium", "high", "urgent"],
      complaint_status: [
        "submitted",
        "in_review",
        "resolved",
        "rejected",
        "cancelled",
      ],
      complaint_update_type: [
        "comment",
        "status_change",
        "assignment",
        "resolution",
        "internal_note",
      ],
      discipline_incident_type: [
        "behavior",
        "attendance",
        "uniform",
        "bullying",
        "damage",
        "academic_misconduct",
        "other",
      ],
      discipline_severity: ["low", "medium", "high", "critical"],
      discipline_status: [
        "draft",
        "submitted",
        "reviewed",
        "resolved",
        "cancelled",
      ],
      discount_status: ["active", "inactive", "archived"],
      discount_value_type: ["percentage", "fixed_amount"],
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
      fee_item_status: ["active", "inactive", "archived"],
      fee_item_type: [
        "tuition",
        "registration",
        "transport",
        "books",
        "uniform",
        "activity",
        "exam",
        "other",
      ],
      fee_structure_status: ["active", "inactive", "archived"],
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
      health_record_status: ["active", "archived"],
      integration_provider: [
        "whatsapp",
        "webhooks",
        "moe",
        "google_calendar",
        "microsoft_calendar",
        "power_bi",
        "looker",
        "zapier",
        "make",
      ],
      integration_status: ["placeholder", "disabled", "configured", "error"],
      invoice_status: [
        "draft",
        "issued",
        "partially_paid",
        "paid",
        "cancelled",
        "void",
      ],
      membership_status: ["active", "invited", "suspended", "archived"],
      message_template_channel: ["in_app", "email", "sms", "whatsapp"],
      message_template_status: ["draft", "active", "archived"],
      notification_channel: ["in_app"],
      notification_status: ["created", "read", "archived", "failed"],
      payment_method: [
        "cash",
        "bank_transfer",
        "card",
        "cheque",
        "online",
        "other",
      ],
      payment_status: [
        "pending",
        "completed",
        "cancelled",
        "failed",
        "refunded",
      ],
      report_card_status: ["draft", "published", "archived"],
      room_status: ["active", "inactive", "archived"],
      school_event_status: ["scheduled", "cancelled", "completed", "archived"],
      school_event_target_type: ["school", "grade_level", "class"],
      school_status: ["active", "inactive", "archived"],
      student_discount_status: ["active", "inactive", "expired", "cancelled"],
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
      survey_question_type: [
        "short_text",
        "long_text",
        "single_choice",
        "multiple_choice",
        "rating",
        "yes_no",
      ],
      survey_status: ["draft", "published", "closed", "archived"],
      survey_target_type: ["school", "role", "grade_level", "class"],
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
      vaccination_status: [
        "scheduled",
        "completed",
        "missed",
        "exempted",
        "unknown",
      ],
    },
  },
} as const

