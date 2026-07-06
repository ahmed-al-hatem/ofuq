import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type { StudentDocument, StudentDocumentType } from "@/types/students"
import type { StudentModuleContext } from "@/lib/students/context"

export const STUDENT_DOCUMENTS_BUCKET = "student-documents"

type DocumentOwner =
  | { student_id: string; admission_id?: never }
  | { admission_id: string; student_id?: never }

export type CreateStudentDocumentMetadataInput = DocumentOwner & {
  document_type: StudentDocumentType
  file_name: string
  file_path: string
  mime_type: string | null
  file_size: number | null
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^\w.-]/g, "-")
}

export function buildAdmissionDocumentPath(
  context: StudentModuleContext,
  admissionId: string,
  fileName: string
): string {
  return [
    "tenants",
    context.tenant_id,
    "schools",
    context.school_id,
    "admissions",
    admissionId,
    sanitizePathSegment(fileName),
  ].join("/")
}

export function buildStudentDocumentPath(
  context: StudentModuleContext,
  studentId: string,
  fileName: string
): string {
  return [
    "tenants",
    context.tenant_id,
    "schools",
    context.school_id,
    "students",
    studentId,
    sanitizePathSegment(fileName),
  ].join("/")
}

export async function createStudentDocumentMetadata(
  context: StudentModuleContext,
  input: CreateStudentDocumentMetadataInput
): Promise<StudentDocument> {
  const supabase = await createSupabaseServerClient()

  const payload: TablesInsert<"student_documents"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    uploaded_by_user_id: context.user_id,
    document_type: input.document_type,
    file_name: input.file_name.trim(),
    file_path: input.file_path.trim(),
    mime_type: input.mime_type,
    file_size: input.file_size,
    student_id: "student_id" in input ? input.student_id ?? null : null,
    admission_id: "admission_id" in input ? input.admission_id ?? null : null,
  }

  const { data, error } = await supabase
    .from("student_documents")
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
