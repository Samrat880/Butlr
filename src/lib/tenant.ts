export const DEFAULT_TENANT_ID = "dev";

export const TENANT_HEADER = "x-tenant-id";

export function resolveTenantId(headerValue: string | null | undefined) {
  const trimmed = headerValue?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_TENANT_ID;
}
