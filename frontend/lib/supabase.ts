/**
 * Auth Client untuk Frontend - Direct API Call ke Backend
 * MENGGANTIKAN Supabase Auth dengan custom JWT-based authentication
 */

import { dapatkanApiUrl } from "./config";

const dapatkanApiUrl_Legacy = () => dapatkanApiUrl();

/**
 * Interface untuk Auth Response dari backend
 */
interface ResponseAuth {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    nama: string | null;
    tingkat_kemahiran: string;
    created_at: string;
  };
}

/**
 * Simpan token ke localStorage
 */
export const simpanToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

/**
 * Ambil token dari localStorage
 */
export const ambilToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

/**
 * Hapus token dari localStorage (logout)
 */
export const hapusToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

/**
 * Login user
 */
export const login = async (
  email: string,
  password: string
): Promise<ResponseAuth> => {
  const API_URL = dapatkanApiUrl_Legacy();
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login gagal");
  }

  const data: ResponseAuth = await response.json();
  simpanToken(data.access_token);
  return data;
};

/**
 * Register user baru
 */
export const register = async (
  email: string,
  password: string,
  nama?: string
): Promise<ResponseAuth> => {
  const API_URL = dapatkanApiUrl_Legacy();
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, nama }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registrasi gagal");
  }

  const data: ResponseAuth = await response.json();
  simpanToken(data.access_token);
  return data;
};

/**
 * Logout user
 */
export const logout = () => {
  hapusToken();
};

/**
 * Ambil profil user yang sedang login
 */
export const ambilProfilSaya = async () => {
  const token = ambilToken();

  if (!token) {
    throw new Error("Tidak ada token, silakan login");
  }

  const API_URL = dapatkanApiUrl_Legacy();
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      hapusToken();
      throw new Error("Token expired, silakan login lagi");
    }
    throw new Error("Gagal mengambil profil");
  }

  return response.json();
};
