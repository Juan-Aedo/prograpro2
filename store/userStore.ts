import { create } from "zustand";
import type { User, ActivityCategory } from "@/lib/types";

interface UserState {
  usuario: User | null;
  estaAutenticado: boolean;
  cargando: boolean;
  cargarUsuario: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  registro: (
    nombre: string,
    email: string,
    password: string,
    preferencias: ActivityCategory[]
  ) => Promise<void>;
  logout: () => Promise<void>;
  actualizarPreferencias: (preferencias: ActivityCategory[]) => Promise<void>;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  usuario: null,
  estaAutenticado: false,
  cargando: false,

  cargarUsuario: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        set({ usuario: null, estaAutenticado: false });
        return;
      }
      const usuario: User = await res.json();
      set({ usuario, estaAutenticado: true });
    } catch {
      set({ usuario: null, estaAutenticado: false });
    }
  },

  login: async (email, password) => {
    set({ cargando: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await parseError(res));
      const usuario: User = await res.json();
      set({ usuario, estaAutenticado: true });
    } finally {
      set({ cargando: false });
    }
  },

  registro: async (nombre, email, password, preferencias) => {
    set({ cargando: true });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, preferencias }),
      });
      if (!res.ok) throw new Error(await parseError(res));
      const usuario: User = await res.json();
      set({ usuario, estaAutenticado: true });
    } finally {
      set({ cargando: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ usuario: null, estaAutenticado: false });
    }
  },

  actualizarPreferencias: async (preferencias) => {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferencias }),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const usuario: User = await res.json();
    set({ usuario });
  },
}));
