"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  MapPin,
  Save,
  Loader2,
  Check,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useLocationStore } from "@/store/locationStore";
import { categoriaLabels } from "@/lib/categorias";
import type { ActivityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    country?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    usuario,
    estaAutenticado,
    inicializado,
    actualizarPerfil,
    actualizarPreferencias,
    actualizarTelefono,
    cambiarPassword,
  } = useUserStore();

  const modoUbicacion = useLocationStore((s) => s.modo);
  const ciudadActiva = useLocationStore((s) => s.ciudad);
  const setManualLocation = useLocationStore((s) => s.setManual);
  const clearManualLocation = useLocationStore((s) => s.clearManual);

  // ── Datos básicos ──────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState<string>("");
  const [sexo, setSexo] = useState<string>("");
  const [guardandoBasico, setGuardandoBasico] = useState(false);
  const [guardadoBasico, setGuardadoBasico] = useState(false);
  const [errorBasico, setErrorBasico] = useState("");

  // ── Preferencias ──────────────────────────────────────────
  const [preferencias, setPreferencias] = useState<ActivityCategory[]>([]);
  const [guardandoPrefs, setGuardandoPrefs] = useState(false);
  const [guardadoPrefs, setGuardadoPrefs] = useState(false);

  // ── Contacto ──────────────────────────────────────────────
  const [telefono, setTelefono] = useState("");
  const [guardandoTel, setGuardandoTel] = useState(false);
  const [guardadoTel, setGuardadoTel] = useState(false);
  const [errorTel, setErrorTel] = useState("");

  // ── Seguridad (contraseña) ────────────────────────────────
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [guardadoPass, setGuardadoPass] = useState(false);
  const [errorPass, setErrorPass] = useState("");

  // ── VPN / Ubicación manual ────────────────────────────────
  const [vpnQuery, setVpnQuery] = useState("");
  const [vpnResultados, setVpnResultados] = useState<NominatimResult[]>([]);
  const [vpnBuscando, setVpnBuscando] = useState(false);
  const [vpnError, setVpnError] = useState("");

  // Redirigir si no está autenticado (sólo después de hidratar sesión)
  useEffect(() => {
    if (inicializado && !estaAutenticado) router.push("/login");
  }, [inicializado, estaAutenticado, router]);

  // Poblar campos con datos del usuario
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre ?? "");
      setEdad(usuario.edad?.toString() ?? "");
      setSexo(usuario.sexo ?? "");
      setPreferencias(usuario.preferencias ?? []);
      setTelefono(usuario.telefono ?? "");
    }
  }, [usuario]);

  // ── Handlers ──────────────────────────────────────────────
  const guardarBasico = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBasico("");
    setGuardandoBasico(true);
    try {
      await actualizarPerfil({
        nombre: nombre.trim() || undefined,
        edad: edad ? parseInt(edad, 10) : undefined,
        sexo:
          (sexo as "masculino" | "femenino" | "no_binario" | "prefiero_no_decir") || undefined,
      });
      setGuardadoBasico(true);
      setTimeout(() => setGuardadoBasico(false), 2500);
    } catch {
      setErrorBasico("No se pudieron guardar los cambios.");
    } finally {
      setGuardandoBasico(false);
    }
  };

  const togglePref = (cat: ActivityCategory) => {
    setPreferencias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const guardarPrefs = async () => {
    setGuardandoPrefs(true);
    try {
      await actualizarPreferencias(preferencias);
      setGuardadoPrefs(true);
      setTimeout(() => setGuardadoPrefs(false), 2500);
    } finally {
      setGuardandoPrefs(false);
    }
  };

  const guardarTelefono = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTel("");
    setGuardandoTel(true);
    try {
      await actualizarTelefono(telefono.trim());
      setGuardadoTel(true);
      setTimeout(() => setGuardadoTel(false), 2500);
    } catch (err) {
      setErrorTel(err instanceof Error ? err.message : "Error al guardar teléfono");
    } finally {
      setGuardandoTel(false);
    }
  };

  const guardarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPass("");
    if (passNueva !== passConfirm) {
      setErrorPass("Las contraseñas nuevas no coinciden");
      return;
    }
    setGuardandoPass(true);
    try {
      await cambiarPassword(passActual, passNueva);
      setGuardadoPass(true);
      setPassActual("");
      setPassNueva("");
      setPassConfirm("");
      setTimeout(() => setGuardadoPass(false), 3000);
    } catch (err) {
      setErrorPass(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setGuardandoPass(false);
    }
  };

  const buscarUbicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpnQuery.trim()) return;
    setVpnError("");
    setVpnBuscando(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&accept-language=es&q=${encodeURIComponent(
          vpnQuery.trim()
        )}`
      );
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data: NominatimResult[] = await res.json();
      setVpnResultados(data);
      if (data.length === 0) setVpnError("No se encontraron resultados");
    } catch (err) {
      setVpnError(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setVpnBuscando(false);
    }
  };

  const seleccionarUbicacion = (r: NominatimResult) => {
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    const ciudad =
      r.address?.city ??
      r.address?.town ??
      r.address?.village ??
      r.address?.county ??
      r.display_name.split(",")[0] ??
      "Ubicación";
    setManualLocation(lat, lng, ciudad);
    setVpnResultados([]);
    setVpnQuery("");
  };

  if (!inicializado || !usuario) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
      </div>
    );
  }

  const categorias = Object.entries(categoriaLabels) as [ActivityCategory, string][];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Cabecera */}
      <div className="mb-10 flex flex-col items-center text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4">
          <span className="font-display text-3xl font-bold text-ink-900">
            {usuario.avatar}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink-900 tracking-tight">
          {usuario.nombre}
        </h1>
        <p className="mt-1 text-sm text-ink-500">{usuario.email}</p>
      </div>

      <div className="space-y-8">
        {/* ── Datos básicos ──────────────────────────── */}
        <section className="card p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <User className="h-4 w-4 text-teal-500" />
            <h2 className="font-display text-lg font-bold text-ink-900">Datos básicos</h2>
          </div>
          <form onSubmit={guardarBasico} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-500">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-field"
                placeholder="Tu nombre"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-500">Edad</label>
                <input
                  type="number"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  className="input-field"
                  min={1}
                  max={120}
                  placeholder="28"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-500">Género</label>
                <select
                  value={sexo}
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
            {errorBasico && <p className="text-xs text-red-500">{errorBasico}</p>}
            <button type="submit" disabled={guardandoBasico} className="btn-primary w-full py-3">
              {guardandoBasico ? (
                <> <Loader2 className="h-4 w-4 animate-spin" /> Guardando... </>
              ) : guardadoBasico ? (
                <> <Check className="h-4 w-4" /> Guardado </>
              ) : (
                <> <Save className="h-4 w-4" /> Guardar cambios </>
              )}
            </button>
          </form>
        </section>

        {/* ── Preferencias ────────────────────────────── */}
        <section className="card p-6 sm:p-8">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-500" />
            <h2 className="font-display text-lg font-bold text-ink-900">Preferencias</h2>
          </div>
          <p className="mb-5 text-sm text-ink-500">
            Selecciona los tipos de panorama que más te gustan. Usaremos esto para mejorar tus
            recomendaciones.
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {categorias.map(([key, label]) => {
              const activa = preferencias.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePref(key)}
                  className={cn(
                    "badge cursor-pointer transition-all duration-150",
                    activa
                      ? "bg-teal-400 text-ink-900 border border-ink-900"
                      : "bg-cream-200 text-ink-600 border border-ink-200 hover:border-ink-400"
                  )}
                >
                  {activa && <Check className="h-3 w-3" />}
                  {label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={guardarPrefs}
            disabled={guardandoPrefs}
            className="btn-primary w-full py-3"
          >
            {guardandoPrefs ? (
              <> <Loader2 className="h-4 w-4 animate-spin" /> Guardando... </>
            ) : guardadoPrefs ? (
              <> <Check className="h-4 w-4" /> Guardado </>
            ) : (
              <> <Save className="h-4 w-4" /> Guardar preferencias </>
            )}
          </button>
        </section>

        {/* ── Contacto ────────────────────────────────── */}
        <section className="card p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <Mail className="h-4 w-4 text-teal-500" />
            <h2 className="font-display text-lg font-bold text-ink-900">Contacto</h2>
          </div>
          <div className="mb-5">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-500">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <input
              type="email"
              value={usuario.email}
              disabled
              className="input-field cursor-not-allowed bg-ink-100 opacity-60"
            />
            <p className="mt-1 text-xs text-ink-400">
              El email está vinculado a tu cuenta y no se puede cambiar desde aquí.
            </p>
          </div>
          <form onSubmit={guardarTelefono} className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <Phone className="h-3.5 w-3.5" /> Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="input-field"
              />
            </div>
            {errorTel && <p className="text-xs text-red-500">{errorTel}</p>}
            <button type="submit" disabled={guardandoTel} className="btn-primary w-full py-3">
              {guardandoTel ? (
                <> <Loader2 className="h-4 w-4 animate-spin" /> Guardando... </>
              ) : guardadoTel ? (
                <> <Check className="h-4 w-4" /> Guardado </>
              ) : (
                <> <Save className="h-4 w-4" /> Guardar teléfono </>
              )}
            </button>
          </form>
        </section>

        {/* ── Ubicación / VPN ────────────────────────── */}
        <section className="card p-6 sm:p-8">
          <div className="mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-teal-500" />
            <h2 className="font-display text-lg font-bold text-ink-900">Ubicación activa</h2>
          </div>
          <p className="mb-5 text-sm text-ink-500">
            Por defecto usamos el GPS de tu dispositivo. Puedes seleccionar manualmente cualquier
            ciudad del mundo para simular que estás ahí (el clima y los panoramas se adaptarán).
          </p>

          {/* Estado actual */}
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-ink-200 bg-cream-200 p-4">
            <MapPin className="h-5 w-5 flex-shrink-0 text-teal-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-500">
                {modoUbicacion === "manual"
                  ? "Ubicación manual activa"
                  : modoUbicacion === "gps"
                  ? "Usando GPS del dispositivo"
                  : "Ubicación por defecto"}
              </p>
              <p className="truncate text-sm font-semibold text-ink-900">{ciudadActiva}</p>
            </div>
            {modoUbicacion === "manual" && (
              <button
                type="button"
                onClick={clearManualLocation}
                className="flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-red-300 hover:text-red-600 cursor-pointer"
              >
                <X className="h-3 w-3" />
                Desactivar
              </button>
            )}
          </div>

          {/* Buscador VPN */}
          <form onSubmit={buscarUbicacion} className="space-y-3">
            <label className="text-xs font-medium text-ink-500">
              Buscar ciudad (modo VPN)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  value={vpnQuery}
                  onChange={(e) => setVpnQuery(e.target.value)}
                  placeholder="Ej: Tokio, París, Buenos Aires..."
                  className="input-field pl-9"
                />
              </div>
              <button
                type="submit"
                disabled={vpnBuscando || !vpnQuery.trim()}
                className="btn-secondary px-4"
              >
                {vpnBuscando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </button>
            </div>
          </form>

          {vpnError && <p className="mt-2 text-xs text-red-500">{vpnError}</p>}

          {vpnResultados.length > 0 && (
            <div className="mt-4 space-y-2">
              {vpnResultados.map((r, i) => (
                <button
                  key={`${r.lat}-${r.lon}-${i}`}
                  type="button"
                  onClick={() => seleccionarUbicacion(r)}
                  className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 text-left transition-all hover:border-teal-400 hover:shadow-offset-sm cursor-pointer"
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 text-ink-400" />
                  <span className="flex-1 truncate text-sm text-ink-700">{r.display_name}</span>
                  <span className="flex-shrink-0 text-xs text-teal-600 font-medium">
                    Usar
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Seguridad ──────────────────────────────── */}
        <section className="card p-6 sm:p-8">
          <div className="mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-500" />
            <h2 className="font-display text-lg font-bold text-ink-900">Seguridad</h2>
          </div>
          <p className="mb-5 text-sm text-ink-500">
            Cambia tu contraseña. Debe tener al menos 8 caracteres, con letras y números.
          </p>
          <form onSubmit={guardarPassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-500">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={mostrarPass ? "text" : "password"}
                  value={passActual}
                  onChange={(e) => setPassActual(e.target.value)}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
                >
                  {mostrarPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-500">
                Nueva contraseña
              </label>
              <input
                type={mostrarPass ? "text" : "password"}
                value={passNueva}
                onChange={(e) => setPassNueva(e.target.value)}
                className="input-field"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-500">
                Confirmar nueva contraseña
              </label>
              <input
                type={mostrarPass ? "text" : "password"}
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                className="input-field"
                minLength={8}
                required
              />
            </div>
            {errorPass && <p className="text-xs text-red-500">{errorPass}</p>}
            <button
              type="submit"
              disabled={guardandoPass}
              className="btn-primary w-full py-3"
            >
              {guardandoPass ? (
                <> <Loader2 className="h-4 w-4 animate-spin" /> Cambiando... </>
              ) : guardadoPass ? (
                <> <Check className="h-4 w-4" /> Contraseña actualizada </>
              ) : (
                <> <Lock className="h-4 w-4" /> Cambiar contraseña </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
