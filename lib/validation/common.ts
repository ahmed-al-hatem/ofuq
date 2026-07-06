import { z } from "zod"

export const uuidSchema = z.string().uuid({ message: "المعرف يجب أن يكون UUID صالحًا" })

export const nonEmptyStringSchema = z
  .string()
  .trim()
  .min(1, { message: "هذا الحقل مطلوب" })

export const optionalStringSchema = z.string().trim().optional()
