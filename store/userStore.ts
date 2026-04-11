import { create } from "zustand";
import type { User, ActivityCategory } from "@/lib/types";

interface UserState {
  usuario: User | null;
  estaAutenticado: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  actualizarPreferencias: (preferencias: ActivityCategory[]) => void;
}

// Usuario mock para desarrollo
const usuarioMock: User = {
  id: "u1",
  nombre: "Matías",
  email: "mati@ejemplo.com",
  avatar: "M",
  preferencias: ["cine", "gastronomia", "musica", "aire-libre"],
};

export const useUserStore = create<UserState>((set) => ({
  usuario: null,
  estaAutenticado: false,

  login: (_email: string, _password: string) => {
    // Simula autenticación con datos mock
    set({ usuario: usuarioMock, estaAutenticado: true });
  },

  logout: () => {
    set({ usuario: null, estaAutenticado: false });
  },

  actualizarPreferencias: (preferencias: ActivityCategory[]) => {
    set((state) => ({
      usuario: state.usuario
        ? { ...state.usuario, preferencias }
        : null,
    }));
  },
}));
