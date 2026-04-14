"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const login = useUserStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }
    setCargando(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
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
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Inicia sesión para ver tus recomendaciones
          </p>
        </div>

        {/* Formulario */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-field" required
              />
            </div>

            <div>
              <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                <Lock className="h-3.5 w-3.5" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="input-field pr-10" required
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
          Cuenta demo: <span className="font-mono">demo@panoramas.cl</span> / <span className="font-mono">demo1234</span>
        </p>
      </div>
    </div>
  );
}
