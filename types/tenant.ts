export type TenantId = string

export type SchoolId = string

export type TenantScoped = {
  tenantId: TenantId
}

export type SchoolScoped = TenantScoped & {
  schoolId: SchoolId | null
}
