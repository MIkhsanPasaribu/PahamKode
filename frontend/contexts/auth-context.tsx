/**
 * Authentication Context Provider
 * Mengelola state autentikasi dengan JWT-based authentication via Backend API
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  login,
  register,
  logout,
  ambilProfilSaya,
  ambilToken,
} from "@/lib/auth";

interface DataPengguna {
  id: string;
  email: string;
  nama: string | null;
  role: string;
  tingkat_kemahiran: string;
  created_at: string;
}

interface KonteksAuth {
  pengguna: DataPengguna | null;
  sedangMemuat: boolean;
  sedangMasuk: boolean;
  apakahAdmin: boolean;
  masuk: (email: string, password: string) => Promise<void>;
  daftar: (email: string, password: string, nama?: string) => Promise<void>;
  keluar: () => void;
}

const KonteksAuth = createContext<KonteksAuth | undefined>(undefined);

export function ProviderAuth({ children }: { children: React.ReactNode }) {
  const [pengguna, setPengguna] = useState<DataPengguna | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangMasuk, setSedangMasuk] = useState(false);

  useEffect(() => {
    // Cek token saat mount
    const cekAuth = async () => {
      const token = ambilToken();

      if (token) {
        try {
          const profil = await ambilProfilSaya();
          setPengguna(profil);
        } catch (error) {
          console.error("Token expired atau invalid:", error);
          setPengguna(null);
        }
      }

      setSedangMemuat(false);
    };

    cekAuth();
  }, []);

  const masuk = async (email: string, password: string) => {
    setSedangMasuk(true);
    try {
      const response = await login(email, password);
      setPengguna(response.user);
    } finally {
      setSedangMasuk(false);
    }
  };

  const daftar = async (email: string, password: string, nama?: string) => {
    setSedangMasuk(true);
    try {
      const response = await register(email, password, nama);
      setPengguna(response.user);
    } finally {
      setSedangMasuk(false);
    }
  };

  const keluar = () => {
    logout();
    setPengguna(null);
  };

  const apakahAdmin = pengguna?.role === "admin";

  const nilai: KonteksAuth = {
    pengguna,
    sedangMemuat,
    sedangMasuk,
    apakahAdmin,
    masuk,
    daftar,
    keluar,
  };

  return <KonteksAuth.Provider value={nilai}>{children}</KonteksAuth.Provider>;
}

export function gunakanAuth() {
  const konteks = useContext(KonteksAuth);
  if (konteks === undefined) {
    throw new Error("gunakanAuth harus digunakan di dalam ProviderAuth");
  }
  return konteks;
}
