"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import type { User, ActivityCategory } from "@/lib/types";
import type { Session } from "@supabase/supabase-js";

interface ProfileUpdate {
  nombre?: string;
  edad?: number;
  sexo?: "masculino" | "femenino" | "no_binario" | "prefiero_no_decir";
  ciudad?: string;
  lat?: number;
  lng?: number;
}

interface UserState {
  usuario: User | null;
  estaAutenticado: boolean;
  inicializado: boolean;
  setUsuario: (session: Session | null) => Promise<void>;
  logout: () => Promise<void>;
  actualizarPreferencias: (preferencias: ActivityCategory[]) => Promise<void>;
  actualizarPerfil: (datos: ProfileUpdate) => Promise<void>;
  actualizarTelefono: (telefono: string) => Promise<void>;
  cambiarPassword: (actual: string, nueva: string) => Promise<void>;
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
    telefono: meta.telefono ?? undefined,
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  usuario: null,
  estaAutenticado: false,
  inicializado: false,

  setUsuario: async (session) => {
    if (!session) {
      set({ usuario: null, estaAutenticado: false, inicializado: true });
      return;
    }

    const base = sessionToUsuario(session);
    set({ usuario: base, estaAutenticado: true, inicializado: true });

    const supabase = createClient();
    if (!supabase) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre, edad, sexo, ciudad, lat, lng")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      set((state) => ({
        usuario: state.usuario
          ? {
              ...state.usuario,
              nombre: profile.nombre ?? state.usuario.nombre,
              edad: profile.edad ?? undefined,
              sexo: profile.sexo ?? undefined,
              ciudad: profile.ciudad ?? undefined,
              lat: profile.lat ?? undefined,
              lng: profile.lng ?? undefined,
            }
          : null,
      }));
    }
  },

  logout: async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    set({ usuario: null, estaAutenticado: false, inicializado: true });
  },

  actualizarPreferencias: async (preferencias: ActivityCategory[]) => {
    set((state) => ({
      usuario: state.usuario ? { ...state.usuario, preferencias } : null,
    }));
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ data: { preferencias } });
    if (error) throw new Error(error.message);
  },

  actualizarPerfil: async (datos: ProfileUpdate) => {
    const supabase = createClient();
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const userId = sessionData.session.user.id;

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...datos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) throw new Error(error.message);

    if (datos.nombre) {
      await supabase.auth.updateUser({ data: { nombre: datos.nombre } });
    }

    set((state) => ({
      usuario: state.usuario ? { ...state.usuario, ...datos } : null,
    }));
  },

  actualizarTelefono: async (telefono: string) => {
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ data: { telefono } });
    if (error) throw new Error(error.message);
    set((state) => ({
      usuario: state.usuario ? { ...state.usuario, telefono } : null,
    }));
  },

  cambiarPassword: async (actual: string, nueva: string) => {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase no configurado");

    const usuario = get().usuario;
    if (!usuario?.email) throw new Error("No hay email del usuario");

    // Validar fortaleza
    if (nueva.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    if (!/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)) {
      throw new Error("La contraseña debe contener letras y números");
    }
    if (nueva === actual) {
      throw new Error("La nueva contraseña debe ser diferente a la actual");
    }

    // Verificar contraseña actual re-autenticando
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: usuario.email,
      password: actual,
    });
    if (authError) throw new Error("La contraseña actual es incorrecta");

    const { error } = await supabase.auth.updateUser({ password: nueva });
    if (error) throw new Error(error.message);
  },
}));
