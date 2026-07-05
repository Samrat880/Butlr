"use client";

import { useEffect, useState } from "react";

import { DEFAULT_TENANT_ID } from "~/lib/tenant";

const STORAGE_KEY = "daybrief-tenant-id";

export function useTenantId() {
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setTenantId(stored);
  }, []);

  const updateTenantId = (value: string) => {
    const next = value.trim() || DEFAULT_TENANT_ID;
    setTenantId(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return { tenantId, setTenantId: updateTenantId };
}

export function getStoredTenantId() {
  if (typeof window === "undefined") return DEFAULT_TENANT_ID;
  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TENANT_ID;
}
