import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Categoria } from "@/lib/types";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar: string; // emoji o inicial
  preferencias: Categoria[];
}

interface UserStore {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  // Acciones
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  actualizarPreferencias: (preferencias: Categoria[]) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      usuario: null,
      estaAutenticado: false,

      iniciarSesion: (usuario) =>
        set({ usuario, estaAutenticado: true }),

      cerrarSesion: () =>
        set({ usuario: null, estaAutenticado: false }),

      actualizarPreferencias: (preferencias) =>
        set((state) => ({
          usuario: state.usuario
            ? { ...state.usuario, preferencias }
            : null,
        })),
    }),
    {
      name: "panoramas-user",
      // Solo persistir datos no sensibles
      partialize: (state) => ({
        usuario: state.usuario,
        estaAutenticado: state.estaAutenticado,
      }),
    }
  )
);
