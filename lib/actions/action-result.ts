export type ActionResult<T = void> =
  | {
      ok: true
      data: T
      message?: string
    }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string[]>
    }

export function success<T>(data: T, message?: string): ActionResult<T> {
  return message ? { ok: true, data, message } : { ok: true, data }
}

export function failure(error: string): ActionResult<never> {
  return { ok: false, error }
}

export function validationFailure(
  fieldErrors: Record<string, string[]>,
  error = "التحقق من البيانات فشل"
): ActionResult<never> {
  return { ok: false, error, fieldErrors }
}
