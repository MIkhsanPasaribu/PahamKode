/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Runtime Configuration untuk Static Export
 *
 * UPDATED: Untuk deployment di VM yang sama dengan backend
 * Frontend akan akses API via relative path (/api/*)
 * Nginx akan proxy ke localhost:8000 (FastAPI)
 */

interface KonfigurasiRuntime {
  apiUrl: string;
}

/**
 * Dapatkan URL API backend dengan prioritas:
 * 1. Window environment (injected by Azure)
 * 2. Build-time environment variable
 * 3. Default relative path /api (untuk same-server deployment)
 */
export function dapatkanKonfigurasi(): KonfigurasiRuntime {
  // Runtime: Cek window object (untuk production)
  if (typeof window !== "undefined" && (window as any).__ENV__) {
    const env = (window as any).__ENV__;
    return {
      apiUrl: env.NEXT_PUBLIC_API_URL || "/api",
    };
  }

  // Build time / Server side: Gunakan process.env atau default
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  };
}

/**
 * Get API URL dengan fallback chain
 */
export function dapatkanApiUrl(): string {
  const config = dapatkanKonfigurasi();
  return config.apiUrl;
}

/**
 * Type declaration untuk window.__ENV__
 */
declare global {
  interface Window {
    __ENV__?: {
      NEXT_PUBLIC_API_URL?: string;
    };
  }
}
