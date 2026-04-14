"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUsuario = useUserStore((s) => s.setUsuario);

  useEffect(() => {
    const supabase = createClient();

    // Si Supabase no está configurado, simplemente no hidratamos el store
    if (!supabase) return;

    // Hidratar el store con la sesión actual al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session);
    });

    // Escuchar cambios de sesión (login, logout, refresh de token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session);
    });

    return () => subscription.unsubscribe();
  }, [setUsuario]);

  return <>{children}</>;
}
