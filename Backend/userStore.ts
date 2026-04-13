import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserPreferences } from "@/lib/types";

// ─────────────────────────────────────────────
//  STORE DE USUARIO — Zustand + persistencia
// ─────────────────────────────────────────────

interface UserStore {
  usuario: User | null;
  estaAutenticado: boolean;

  // Actions
  iniciarSesion: (usuario: User) => void;
  cerrarSesion: () => void;
  actualizarPreferencias: (prefs: Partial<UserPreferences>) => void;
}

// Usuario demo para desarrollo
export const USUARIO_DEMO: User = {
  id: "u1",
  nombre: "Valentina Torres",
  email: "val@panoramas.cl",
  avatar: "VT",
  preferences: {
    categorias: ["parques", "gastronomia", "museos", "aire-libre", "talleres"],
    presupuesto: "medio",
    evitar: ["nightlife"],
    prefiereExterior: true,
    maxDistanciaKm: 30,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      usuario: USUARIO_DEMO, // Autenticado por defecto en demo
      estaAutenticado: true,

      iniciarSesion: (usuario) => set({ usuario, estaAutenticado: true }),

      cerrarSesion: () => set({ usuario: null, estaAutenticado: false }),

      actualizarPreferencias: (prefs) => {
        const { usuario } = get();
        if (!usuario) return;
        set({
          usuario: {
            ...usuario,
            preferences: { ...usuario.preferences, ...prefs },
          },
        });
      },
    }),
    {
      name: "panoramas-user",
    }
  )
);
