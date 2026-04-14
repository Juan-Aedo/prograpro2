"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Mail, User, ArrowRight, Check, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { categoriaLabels } from "@/lib/mock-data";
import type { ActivityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [preferencias, setPreferencias] = useState<ActivityCategory[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const togglePreferencia = (cat: ActivityCategory) => {
    setPreferencias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Paso 1: enviar OTP (crea usuario si no existe)
  const handlePaso1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase no está configurado. Añade las claves en .env.local.");
      setCargando(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { nombre },
      },
    });

    if (error) {
      setError("No se pudo enviar el código. Intenta de nuevo.");
    } else {
      setPaso(2);
    }
    setCargando(false);
  };

  // Paso 2: guardar preferencias y avanzar a verificación
  const handlePaso2 = (e: React.FormEvent) => {
    e.preventDefault();
    setPaso(3);
  };

  // Paso 3: verificar OTP y guardar preferencias
  const handlePaso3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase no está configurado.");
      setCargando(false);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      setError("Código incorrecto o expirado. Intenta de nuevo.");
      setCargando(false);
      return;
    }

    // Guardar nombre y preferencias en user_metadata
    await supabase.auth.updateUser({ data: { nombre, preferencias } });

    router.push("/");
    router.refresh();
    setCargando(false);
  };

  const loginConGoogle = async () => {
    setCargando(true);
    const supabase = createClient();
    if (!supabase) { setCargando(false); return; }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const pasoActivo = paso;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4 transition-all duration-150 hover:shadow-offset-sm">
            <Compass className="h-6 w-6 text-ink-900" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {paso === 1
              ? "Completa tus datos para comenzar"
              : paso === 2
              ? "Selecciona tus intereses"
              : "Verifica tu email"}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mb-6 max-w-[240px] mx-auto">
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors duration-300",
                pasoActivo >= p
                  ? "bg-teal-400 border border-teal-500/30"
                  : "bg-ink-200"
              )}
            />
          ))}
        </div>

        <div className="card p-6 sm:p-8">
          {/* ---- Paso 1: datos ---- */}
          {paso === 1 && (
            <>
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
                Registrarse con Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ink-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-cream-100 px-3 text-xs text-ink-400">o con email</span>
                </div>
              </div>

              <form onSubmit={handlePaso1} className="space-y-5">
                <div>
                  <label htmlFor="nombre" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <User className="h-3.5 w-3.5" /> Nombre
                  </label>
                  <input
                    id="nombre" type="text" value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre" className="input-field" required
                  />
                </div>
                <div>
                  <label htmlFor="email-r" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <input
                    id="email-r" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com" className="input-field" required
                  />
                </div>

                {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

                <button type="submit" disabled={cargando} className="btn-primary w-full py-3">
                  {cargando ? (
                    <span className="animate-pulse-soft">Enviando código...</span>
                  ) : (
                    <> Continuar <ArrowRight className="h-4 w-4" /> </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ---- Paso 2: preferencias ---- */}
          {paso === 2 && (
            <form onSubmit={handlePaso2} className="space-y-5">
              <div>
                <p className="text-sm font-medium text-ink-700 mb-3">
                  ¿Qué tipo de actividades te interesan?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(categoriaLabels).map(([key, label]) => (
                    <button
                      key={key} type="button"
                      onClick={() => togglePreferencia(key as ActivityCategory)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 cursor-pointer",
                        preferencias.includes(key as ActivityCategory)
                          ? "border-teal-400 bg-teal-50 text-teal-700"
                          : "border-ink-200 text-ink-600 hover:border-teal-300 hover:bg-cream-200"
                      )}
                    >
                      {preferencias.includes(key as ActivityCategory) && (
                        <Check className="h-4 w-4 flex-shrink-0" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Continuar <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button" onClick={() => setPaso(1)}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
              >
                Volver atrás
              </button>
            </form>
          )}

          {/* ---- Paso 3: verificar OTP ---- */}
          {paso === 3 && (
            <form onSubmit={handlePaso3} className="space-y-5">
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 border border-teal-200">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <p className="text-sm text-ink-500 text-center">
                  Enviamos un código a{" "}
                  <span className="font-semibold text-ink-700">{email}</span>
                </p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
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
                disabled={cargando || token.length < 6 || token.length > 8}
                className="btn-primary w-full py-3"
              >
                {cargando ? (
                  <span className="animate-pulse-soft">Creando cuenta...</span>
                ) : (
                  <> Crear Cuenta <ArrowRight className="h-4 w-4" /> </>
                )}
              </button>

              <button
                type="button" onClick={() => setPaso(2)}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
              >
                Volver atrás
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
