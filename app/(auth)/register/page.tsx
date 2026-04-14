"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { categoriaLabels } from "@/lib/categorias";
import type { ActivityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [preferencias, setPreferencias] = useState<ActivityCategory[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const registro = useUserStore((s) => s.registro);

  const togglePreferencia = (cat: ActivityCategory) => {
    setPreferencias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (paso === 1) { setPaso(2); return; }
    setCargando(true);
    try {
      await registro(nombre, email, password, preferencias);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuenta");
      setPaso(1);
    } finally {
      setCargando(false);
    }
  };

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
            {paso === 1 ? "Completa tus datos para comenzar" : "Selecciona tus intereses"}
          </p>
        </div>

        {/* Indicador de paso */}
        <div className="flex items-center gap-2 mb-6 max-w-[200px] mx-auto">
          <div className="flex-1 h-1.5 rounded-full bg-teal-400 border border-teal-500/30" />
          <div className={cn("flex-1 h-1.5 rounded-full transition-colors duration-300", paso === 2 ? "bg-teal-400 border border-teal-500/30" : "bg-ink-200")} />
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {paso === 1 ? (
              <>
                <div>
                  <label htmlFor="nombre" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <User className="h-3.5 w-3.5" /> Nombre
                  </label>
                  <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre" className="input-field" required />
                </div>
                <div>
                  <label htmlFor="email-r" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <input id="email-r" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com" className="input-field" required />
                </div>
                <div>
                  <label htmlFor="pw-r" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <Lock className="h-3.5 w-3.5" /> Contraseña
                  </label>
                  <div className="relative">
                    <input id="pw-r" type={mostrarPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"
                      className="input-field pr-10" required minLength={8} />
                    <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer">
                      {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-medium text-ink-700 mb-3">¿Qué tipo de actividades te interesan?</p>
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
                      {preferencias.includes(key as ActivityCategory) && <Check className="h-4 w-4 flex-shrink-0" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-500 animate-scale-in">{error}</p>}

            <button type="submit" disabled={cargando} className="btn-primary w-full py-3">
              {cargando ? (
                <span className="animate-pulse-soft">Creando cuenta...</span>
              ) : paso === 1 ? (
                <> Continuar <ArrowRight className="h-4 w-4" /> </>
              ) : (
                <> Crear Cuenta <ArrowRight className="h-4 w-4" /> </>
              )}
            </button>

            {paso === 2 && (
              <button type="button" onClick={() => setPaso(1)}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-800 transition-colors cursor-pointer">
                Volver atrás
              </button>
            )}
          </form>

          {paso === 1 && (
            <>
              <div className="relative my-6">
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
        </div>
      </div>
    </div>
  );
}
