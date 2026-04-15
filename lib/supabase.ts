import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase no está configurado");
    return null;
  }
  // createBrowserClient escribe la sesión en cookies además de localStorage,
  // así el middleware (SSR) puede verla al renderizar rutas protegidas.
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
