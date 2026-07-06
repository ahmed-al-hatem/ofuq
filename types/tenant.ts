export type TenantId = string

export type SchoolId = string

export type TenantScoped = {
  tenant_id: TenantId
}

export type SchoolScoped = TenantScoped & {
  school_id: SchoolId
}

export type MaybeSchoolScoped = TenantScoped & {
  school_id: SchoolId | null
}
