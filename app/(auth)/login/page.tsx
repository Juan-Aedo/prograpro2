"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Mail, Lock, ArrowRight, Shield, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Tab = "password" | "otp";
type Vista = "opciones" | "verificar";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("password");
  const [vista, setVista] = useState<Vista>("opciones");

  // Campos compartidos
  const [email, setEmail] = useState("");

  // Tab contraseña
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Tab OTP
  const [token, setToken] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // ── Login con contraseña ────────────────────────────────────────────────
  const loginConPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase no está configurado. Añade las claves en .env.local.");
      setCargando(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      if (err.message.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos. ¿Aún no tienes cuenta?");
      } else {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    } else {
      router.push("/");
      router.refresh();
    }
    setCargando(false);
  };

  // ── Login con OTP — enviar código ───────────────────────────────────────
  const enviarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase no está configurado. Añade las claves en .env.local.");
      setCargando(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (err) {
      setError("No se pudo enviar el código. Verificá que el email esté registrado.");
    } else {
      setVista("verificar");
    }
    setCargando(false);
  };

  // ── Login con OTP — verificar código ───────────────────────────────────
  const verificarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase no está configurado.");
      setCargando(false);
      return;
    }

    const { error: err } = await supabase.auth.verifyOtp({ email, token, type: "email" });

    if (err) {
      setError("Código incorrecto o expirado. Intenta de nuevo.");
    } else {
      router.push("/");
      router.refresh();
    }
    setCargando(false);
  };

  // ── Login con Google ────────────────────────────────────────────────────
  const loginConGoogle = async () => {
    setCargando(true);
    const supabase = createClient();
    if (!supabase) { setCargando(false); return; }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ── Vista: verificación OTP ─────────────────────────────────────────────
  if (tab === "otp" && vista === "verificar") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4">
              <Shield className="h-6 w-6 text-ink-900" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
              Revisa tu email
            </h1>
            <p className="mt-1 text-sm text-ink-500 text-center">
              Enviamos un código a{" "}
              <span className="font-semibold text-ink-700">{email}</span>
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <form onSubmit={verificarOtp} className="space-y-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                  <Shield className="h-3.5 w-3.5" /> Código de verificación
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="00000000"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={8}
                  required
                  autoFocus
                />
              </div>

              {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

              <button
                type="submit"
                disabled={cargando || token.length < 6}
                className="btn-primary w-full py-3"
              >
                {cargando ? (
                  <span className="animate-pulse-soft">Verificando...</span>
                ) : (
                  <> Confirmar <ArrowRight className="h-4 w-4" /> </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setVista("opciones"); setToken(""); setError(""); }}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
              >
                Volver a opciones de acceso
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista principal ─────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4 transition-all duration-150 hover:shadow-offset-sm">
            <Compass className="h-6 w-6 text-ink-900" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Inicia sesión para ver tus recomendaciones
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {/* Google */}
          <button
            onClick={loginConGoogle}
            disabled={cargando}
            className="btn-secondary w-full py-3 mb-6"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>

          {/* Tabs */}
          <div className="flex rounded-xl border border-ink-200 overflow-hidden mb-5">
            <button
              type="button"
              onClick={() => { setTab("password"); setError(""); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors cursor-pointer",
                tab === "password"
                  ? "bg-teal-400 text-ink-900"
                  : "bg-transparent text-ink-500 hover:bg-cream-200"
              )}
            >
              Con contraseña
            </button>
            <button
              type="button"
              onClick={() => { setTab("otp"); setError(""); setVista("opciones"); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors cursor-pointer",
                tab === "otp"
                  ? "bg-teal-400 text-ink-900"
                  : "bg-transparent text-ink-500 hover:bg-cream-200"
              )}
            >
              Con código único
            </button>
          </div>

          {/* Form contraseña */}
          {tab === "password" && (
            <form onSubmit={loginConPassword} className="space-y-5">
              <div>
                <label htmlFor="email-pw" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <input
                  id="email-pw"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                  <Lock className="h-3.5 w-3.5" /> Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
                  >
                    {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

              <button type="submit" disabled={cargando} className="btn-primary w-full py-3">
                {cargando ? (
                  <span className="animate-pulse-soft">Ingresando...</span>
                ) : (
                  <> Iniciar Sesión <ArrowRight className="h-4 w-4" /> </>
                )}
              </button>
            </form>
          )}

          {/* Form OTP */}
          {tab === "otp" && (
            <form onSubmit={enviarOtp} className="space-y-5">
              <div>
                <label htmlFor="email-otp" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <input
                  id="email-otp"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input-field"
                  required
                />
              </div>

              {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

              <button type="submit" disabled={cargando} className="btn-primary w-full py-3">
                {cargando ? (
                  <span className="animate-pulse-soft">Enviando código...</span>
                ) : (
                  <> Enviar código <ArrowRight className="h-4 w-4" /> </>
                )}
              </button>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-cream-100 px-3 text-xs text-ink-400">¿No tienes cuenta?</span>
            </div>
          </div>
          <Link href="/register" className="btn-secondary w-full">Crear Cuenta</Link>
        </div>

        <p className="mt-4 text-center text-xs text-ink-400">
          Te enviamos un código seguro a tu correo si elegís ese método
        </p>
      </div>
    </div>
  );
}
