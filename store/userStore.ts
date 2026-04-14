"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import type { User, ActivityCategory } from "@/lib/types";
import type { Session } from "@supabase/supabase-js";

interface UserState {
  usuario: User | null;
  estaAutenticado: boolean;
  setUsuario: (session: Session | null) => void;
  logout: () => Promise<void>;
  actualizarPreferencias: (preferencias: ActivityCategory[]) => void;
}

function sessionToUsuario(session: Session): User {
  const meta = session.user.user_metadata;
  return {
    id: session.user.id,
    nombre:
      meta.full_name ??
      meta.nombre ??
      session.user.email?.split("@")[0] ??
      "Usuario",
    email: session.user.email ?? "",
    avatar: (meta.full_name?.[0] ?? meta.nombre?.[0] ?? "U").toUpperCase(),
    preferencias: meta.preferencias ?? [],
  };
}

export const useUserStore = create<UserState>((set) => ({
  usuario: null,
  estaAutenticado: false,

  setUsuario: (session) => {
    if (session) {
      set({ usuario: sessionToUsuario(session), estaAutenticado: true });
    } else {
      set({ usuario: null, estaAutenticado: false });
    }
  },

  logout: async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    set({ usuario: null, estaAutenticado: false });
  },

  actualizarPreferencias: (preferencias: ActivityCategory[]) => {
    set((state) => ({
      usuario: state.usuario ? { ...state.usuario, preferencias } : null,
    }));
    const supabase = createClient();
    if (supabase) supabase.auth.updateUser({ data: { preferencias } });
  },
}));
