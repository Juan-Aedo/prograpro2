import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function supabaseConfigurado(): boolean {
  return (
    SUPABASE_URL.length > 0 &&
    SUPABASE_ANON_KEY.length > 0 &&
    !SUPABASE_URL.includes("your-project-ref")
  );
}

// Devuelve null cuando las credenciales no están configuradas
// para que los componentes puedan degradarse sin lanzar errores.
export function createClient() {
  if (!supabaseConfigurado()) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
