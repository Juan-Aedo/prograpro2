"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import { useLocationStore } from "@/store/locationStore";
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
  actualizarPreferencias: (preferencias: ActivityCategory[]) => void;
  actualizarPerfil: (datos: ProfileUpdate) => Promise<void>;
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
  inicializado: false,

  setUsuario: async (session) => {
    if (!session) {
      set({ usuario: null, estaAutenticado: false, inicializado: true });
      return;
    }

    const base = sessionToUsuario(session);
    set({ usuario: base, estaAutenticado: true, inicializado: true });

    // Cargar datos extendidos desde la tabla profiles
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

      // Hidratar el store global de ubicación con la ciudad guardada del usuario
      if (profile.ciudad && profile.lat != null && profile.lng != null) {
        useLocationStore.getState().setManual(profile.lat, profile.lng, profile.ciudad);
      }
    }

    // Migrar datos desde Supabase a Postgres local al iniciar sesión
    // (cubre flujos OAuth/Google/OTP que no pasan por el registro con contraseña)
    fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: profile?.nombre ?? base.nombre,
        preferencias: base.preferencias ?? [],
        edad: profile?.edad ?? null,
        sexo: profile?.sexo ?? null,
        ciudad: profile?.ciudad ?? null,
        lat: profile?.lat ?? null,
        lng: profile?.lng ?? null,
      }),
    }).catch(() => {});
  },

  logout: async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    set({ usuario: null, estaAutenticado: false, inicializado: true });
    useLocationStore.getState().clearManual();
  },

  actualizarPreferencias: (preferencias: ActivityCategory[]) => {
    set((state) => ({
      usuario: state.usuario ? { ...state.usuario, preferencias } : null,
    }));
    const supabase = createClient();
    if (supabase) supabase.auth.updateUser({ data: { preferencias } });
    // Migrar a Postgres local
    fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferencias }),
    }).catch(() => {});
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

    // Actualizar nombre también en auth metadata si se cambió
    if (datos.nombre) {
      await supabase.auth.updateUser({ data: { nombre: datos.nombre } });
    }

    // Migrar datos a Postgres local
    try {
      await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
    } catch {
      // No bloquear si BD local no está disponible
    }

    set((state) => ({
      usuario: state.usuario
        ? {
            ...state.usuario,
            ...datos,
            ...(datos.nombre && { avatar: datos.nombre[0].toUpperCase() }),
          }
        : null,
    }));
  },
}));