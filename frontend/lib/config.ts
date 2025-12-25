/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Runtime Configuration untuk Static Export
 *
 * Problem: Next.js static export tidak support runtime env vars
 * Solution: Baca config dari window object yang di-inject saat runtime
 *
 * Flow:
 * 1. Build time: Gunakan default values
 * 2. Runtime: Azure Static Web Apps inject env vars via staticwebapp.config.json
 * 3. Client: Baca dari window.__ENV__ atau fallback ke default
 */

interface KonfigurasiRuntime {
  apiUrl: string;
}

/**
 * Dapatkan URL API backend dengan prioritas:
 * 1. Window environment (injected by Azure)
 * 2. Build-time environment variable
 * 3. Default localhost untuk development
 */
export function dapatkanKonfigurasi(): KonfigurasiRuntime {
  // Runtime: Cek window object (untuk production)
  if (typeof window !== "undefined" && (window as any).__ENV__) {
    const env = (window as any).__ENV__;
    return {
      apiUrl: env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    };
  }

  // Build time / Server side: Gunakan process.env
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
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
