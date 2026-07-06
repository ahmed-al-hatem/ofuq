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
      academic_year_status: "draft" | "active" | "closed" | "archived"
      admission_status: "pending" | "approved" | "rejected" | "cancelled"
      class_enrollment_status:
        | "active"
        | "transferred"
        | "withdrawn"
        | "completed"
        | "archived"
      class_status: "active" | "inactive" | "archived"
      grade_level_stage:
        | "kindergarten"
        | "primary"
        | "middle"
        | "secondary"
        | "other"
      grade_level_status: "active" | "inactive" | "archived"
      guardian_relation: "father" | "mother" | "guardian" | "other"
      membership_status: "active" | "invited" | "suspended" | "archived"
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
      tenant_status: "active" | "inactive" | "suspended"
      term_status: "draft" | "active" | "closed" | "archived"
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
      academic_year_status: ["draft", "active", "closed", "archived"],
      admission_status: ["pending", "approved", "rejected", "cancelled"],
      class_enrollment_status: [
        "active",
        "transferred",
        "withdrawn",
        "completed",
        "archived",
      ],
      class_status: ["active", "inactive", "archived"],
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
      tenant_status: ["active", "inactive", "suspended"],
      term_status: ["draft", "active", "closed", "archived"],
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

