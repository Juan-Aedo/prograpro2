"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass, Mail, User, ArrowRight, Check, Shield,
  Lock, Eye, EyeOff, MapPin, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { categoriaLabels } from "@/lib/categorias";
import { useGeoLocation } from "@/lib/hooks/useGeoLocation";
import type { ActivityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Modo = "password" | "otp";

export default function RegisterPage() {
  const [modo, setModo] = useState<Modo>("password");

  // ── Campos comunes ──────────────────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [email, setEmail]   = useState("");
  const [preferencias, setPreferencias] = useState<ActivityCategory[]>([]);
  const [error, setError]   = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // ── Modo contraseña ─────────────────────────────────────────────────────
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Campos de perfil (paso 2)
  const [edad, setEdad]     = useState<string>("");
  const [sexo, setSexo]     = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");
  const [lat, setLat]       = useState<number | null>(null);
  const [lng, setLng]       = useState<number | null>(null);
  const { loading: gpsLoading, detectar: detectarGps } = useGeoLocation();

  // ── Modo OTP ────────────────────────────────────────────────────────────
  const [pasoOtp, setPasoOtp] = useState<1 | 2 | 3>(1);
  const [token, setToken] = useState("");

  const togglePreferencia = (cat: ActivityCategory) => {
    setPreferencias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const detectarUbicacion = async () => {
    setError("");
    const result = await detectarGps();
    if (!result) {
      setError("No se pudo obtener tu ubicación. Escríbela manualmente.");
      return;
    }
    setLat(result.lat);
    setLng(result.lng);
    if (result.ciudad) setCiudad(result.ciudad);
  };

  // ══════════════════════════════════════════════════════════════════════
  // MODO CONTRASEÑA
  // ══════════════════════════════════════════════════════════════════════

  const handlePw1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPaso(2);
  };

  const handlePw2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPaso(3);
  };

  const handlePw4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const supabase = createClient();

      if (!supabase) {
        setError("Supabase no está configurado. Añade las claves en .env.local.");
        return;
      }

      // 1. Crear cuenta con email+password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre } },
      });

      if (signUpError) {
        if (
          signUpError.message.includes("already registered") ||
          signUpError.message.includes("User already registered")
        ) {
          setError("Ya existe una cuenta con ese email. ¿Quieres iniciar sesión?");
        } else {
          setError(`No se pudo crear la cuenta: ${signUpError.message}`);
        }
        return;
      }

      // 2. Guardar preferencias en metadata (solo si hay sesión activa)
      if (data.session) {
        await supabase.auth.updateUser({ data: { nombre, preferencias } });
      }

      // 3. Guardar perfil extendido si el usuario fue creado
      const userId = data.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert(
          {
            id: userId,
            nombre,
            edad: edad ? parseInt(edad, 10) : null,
            sexo: sexo || null,
            ciudad: ciudad || null,
            lat: lat ?? null,
            lng: lng ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      // 4. Redirigir si hay sesión (confirmación desactivada)
      //    o mostrar pantalla de "revisa tu email" si no
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setPaso(4);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Error: ${err.message}`
          : "Error inesperado. Intenta de nuevo."
      );
    } finally {
      setCargando(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // MODO OTP
  // ══════════════════════════════════════════════════════════════════════

  const handleOtp1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase no está configurado.");
      setCargando(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { nombre } },
    });

    if (err) {
      setError("No se pudo enviar el código. Intenta de nuevo.");
    } else {
      setPasoOtp(2);
    }
    setCargando(false);
  };

  const handleOtp2 = (e: React.FormEvent) => {
    e.preventDefault();
    setPasoOtp(3);
  };

  const handleOtp3 = async (e: React.FormEvent) => {
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
      setCargando(false);
      return;
    }

    await supabase.auth.updateUser({ data: { nombre, preferencias } });
    router.push("/");
    router.refresh();
    setCargando(false);
  };

  // ── Google ──────────────────────────────────────────────────────────────
  const loginConGoogle = async () => {
    setCargando(true);
    const supabase = createClient();
    if (!supabase) { setCargando(false); return; }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ══════════════════════════════════════════════════════════════════════
  // RENDER — Modo contraseña
  // ══════════════════════════════════════════════════════════════════════

  const totalPasos = 4;

  if (modo === "password") {
    // Pantalla final: email enviado
    if (paso === 4 && !cargando) {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md animate-fade-in text-center">
            <div className="flex flex-col items-center mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4">
                <Check className="h-7 w-7 text-ink-900" />
              </div>
              <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
                ¡Cuenta creada!
              </h1>
              <p className="mt-2 text-sm text-ink-500 max-w-xs">
                Te enviamos un link de confirmación a{" "}
                <span className="font-semibold text-ink-700">{email}</span>.
                Revisa tu correo y haz clic en el link para activar tu cuenta.
              </p>
            </div>
            <div className="card p-6 space-y-3">
              <Link href="/login" className="btn-primary w-full block text-center py-3">
                Ir al login
              </Link>
              <p className="text-xs text-ink-400">
                Si no ves el email, revisa la carpeta de spam.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Cabecera */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4">
              <Compass className="h-6 w-6 text-ink-900" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
              Crea tu cuenta
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {paso === 1
                ? "Completa tus datos para comenzar"
                : paso === 2
                ? "Datos de perfil (opcional)"
                : paso === 3
                ? "Selecciona tus intereses"
                : "Verificando..."}
            </p>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-2 mb-6 max-w-[280px] mx-auto">
            {Array.from({ length: totalPasos }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-colors duration-300",
                  paso > i
                    ? "bg-teal-400 border border-teal-500/30"
                    : "bg-ink-200"
                )}
              />
            ))}
          </div>

          <div className="card p-6 sm:p-8">
            {/* ── Paso 1: datos de acceso ── */}
            {paso === 1 && (
              <>
                {/* Google */}
                <button
                  onClick={loginConGoogle}
                  disabled={cargando}
                  className="btn-secondary w-full py-3 mb-5"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Registrarse con Google
                </button>

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ink-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-cream-100 px-3 text-xs text-ink-400">o con email</span>
                  </div>
                </div>

                <form onSubmit={handlePw1} className="space-y-5">
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
                  <div>
                    <label htmlFor="pw-r" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                      <Lock className="h-3.5 w-3.5" /> Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="pw-r"
                        type={mostrarPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="input-field pr-10" required minLength={8}
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

                  <button type="submit" className="btn-primary w-full py-3">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ink-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-cream-100 px-3 text-xs text-ink-400">otras opciones</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setModo("otp"); setError(""); }}
                  className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
                >
                  Usar código único por email
                </button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ink-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-cream-100 px-3 text-xs text-ink-400">¿Ya tienes cuenta?</span>
                  </div>
                </div>
                <Link href="/login" className="btn-secondary w-full">Iniciar Sesión</Link>
              </>
            )}

            {/* ── Paso 2: perfil opcional ── */}
            {paso === 2 && (
              <form onSubmit={handlePw2} className="space-y-5">
                <p className="text-xs text-ink-400 -mt-1 mb-1">
                  Estos datos son opcionales. Puedes completarlos ahora o editarlos luego en tu perfil.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edad" className="text-xs font-medium text-ink-500 mb-1.5 block">
                      Edad
                    </label>
                    <input
                      id="edad" type="number" value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      placeholder="Ej: 28" className="input-field" min={1} max={120}
                    />
                  </div>
                  <div>
                    <label htmlFor="sexo" className="text-xs font-medium text-ink-500 mb-1.5 block">
                      Género
                    </label>
                    <select
                      id="sexo" value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Prefiero no decir</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="no_binario">No binario</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ciudad" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Ciudad predeterminada
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="ciudad" type="text" value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      placeholder="Ej: Santiago de Chile" className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={detectarUbicacion}
                      disabled={gpsLoading}
                      title="Detectar mi ubicación"
                      className="px-3 rounded-xl border border-ink-200 text-ink-500 hover:border-teal-400 hover:text-teal-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {gpsLoading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <MapPin className="h-4 w-4" />}
                    </button>
                  </div>
                  {lat && (
                    <p className="text-xs text-teal-600 mt-1">
                      Ubicación detectada ({lat.toFixed(3)}, {lng?.toFixed(3)})
                    </p>
                  )}
                </div>

                {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

                <button type="submit" className="btn-primary w-full py-3">
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setEdad(""); setSexo(""); setCiudad(""); setLat(null); setLng(null); setPaso(3); }}
                  className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
                >
                  Saltar por ahora
                </button>
                <button
                  type="button" onClick={() => setPaso(1)}
                  className="w-full text-center text-sm text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
                >
                  Volver atrás
                </button>
              </form>
            )}

            {/* ── Paso 3: preferencias ── */}
            {paso === 3 && (
              <form onSubmit={handlePw4} className="space-y-5">
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

                {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

                <button type="submit" disabled={cargando} className="btn-primary w-full py-3">
                  {cargando
                    ? <span className="animate-pulse-soft">Creando cuenta...</span>
                    : <> Crear Cuenta <ArrowRight className="h-4 w-4" /> </>}
                </button>
                <button
                  type="button"
                  onClick={() => { setPaso(2); setCargando(false); setError(""); }}
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

  // ══════════════════════════════════════════════════════════════════════
  // RENDER — Modo OTP
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4">
            <Compass className="h-6 w-6 text-ink-900" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {pasoOtp === 1
              ? "Registro con código único"
              : pasoOtp === 2
              ? "Selecciona tus intereses"
              : "Verifica tu email"}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mb-6 max-w-[200px] mx-auto">
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors duration-300",
                pasoOtp >= p ? "bg-teal-400 border border-teal-500/30" : "bg-ink-200"
              )}
            />
          ))}
        </div>

        <div className="card p-6 sm:p-8">
          {/* OTP Paso 1 */}
          {pasoOtp === 1 && (
            <>
              <button
                onClick={loginConGoogle}
                disabled={cargando}
                className="btn-secondary w-full py-3 mb-5"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Registrarse con Google
              </button>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ink-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-cream-100 px-3 text-xs text-ink-400">o con código</span>
                </div>
              </div>

              <form onSubmit={handleOtp1} className="space-y-5">
                <div>
                  <label htmlFor="nombre-otp" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <User className="h-3.5 w-3.5" /> Nombre
                  </label>
                  <input
                    id="nombre-otp" type="text" value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre" className="input-field" required
                  />
                </div>
                <div>
                  <label htmlFor="email-otp-r" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <input
                    id="email-otp-r" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com" className="input-field" required
                  />
                </div>

                {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

                <button type="submit" disabled={cargando} className="btn-primary w-full py-3">
                  {cargando
                    ? <span className="animate-pulse-soft">Enviando código...</span>
                    : <> Continuar <ArrowRight className="h-4 w-4" /> </>}
                </button>
              </form>

              <button
                type="button"
                onClick={() => { setModo("password"); setError(""); }}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer mt-4"
              >
                Volver a registro con contraseña
              </button>
            </>
          )}

          {/* OTP Paso 2: preferencias */}
          {pasoOtp === 2 && (
            <form onSubmit={handleOtp2} className="space-y-5">
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
                type="button" onClick={() => setPasoOtp(1)}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
              >
                Volver atrás
              </button>
            </form>
          )}

          {/* OTP Paso 3: verificar código */}
          {pasoOtp === 3 && (
            <form onSubmit={handleOtp3} className="space-y-5">
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
                  <Shield className="h-3.5 w-3.5" /> Código de verificación
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="00000000"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={8} required autoFocus
                />
              </div>

              {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

              <button
                type="submit"
                disabled={cargando || token.length < 6}
                className="btn-primary w-full py-3"
              >
                {cargando
                  ? <span className="animate-pulse-soft">Creando cuenta...</span>
                  : <> Crear Cuenta <ArrowRight className="h-4 w-4" /> </>}
              </button>
              <button
                type="button" onClick={() => setPasoOtp(2)}
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