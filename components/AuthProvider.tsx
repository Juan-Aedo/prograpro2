"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUsuario = useUserStore((s) => s.setUsuario);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session);
    });

    return () => sub.subscription.unsubscribe();
  }, [setUsuario]);

  return <>{children}</>;
}