"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  MapPin,
  Save,
  Loader2,
  Check,
  Heart,
  Settings,
  LogOut,
  ArrowLeft,
  Shield,
  Lock,
  Key,
  Chrome,
} from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";
import { useLocationStore } from "@/store/locationStore";
import { categoriaLabels } from "@/lib/categorias";
import { useGeoLocation, geocodificarTexto } from "@/lib/hooks/useGeoLocation";
import { CAPITALES_REGIONALES, type CapitalRegional } from "@/lib/capitalesRegionales";
import type { ActivityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

// Normaliza texto para búsqueda tolerante a tildes/mayúsculas
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type Seccion = "personal" | "preferencias" | "seguridad";

interface SecurityInfo {
  tieneHashBcrypt: boolean;
  hashParcial: string | null;
  proveedor: string;
  email: string;
}

export default function CuentaPage() {
  const router = useRouter();
  const {
    usuario,
    estaAutenticado,
    inicializado,
    actualizarPerfil,
    actualizarPreferencias,
    logout,
  } = useUserStore();
  const setManualLocation = useLocationStore((s) => s.setManual);

  const [seccion, setSeccion] = useState<Seccion>("personal");

  // Información personal
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState<string>("");
  const [sexo, setSexo] = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Autocomplete de ciudad
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const ciudadWrapperRef = useRef<HTMLDivElement>(null);

  // Preferencias
  const [preferencias, setPreferencias] = useState<ActivityCategory[]>([]);

  // Estado UI
  const [guardandoPersonal, setGuardandoPersonal] = useState(false);
  const [guardandoPrefs, setGuardandoPrefs] = useState(false);
  const { loading: gpsLoading, detectar: detectarGps } = useGeoLocation();
  const [okPersonal, setOkPersonal] = useState(false);
  const [okPrefs, setOkPrefs] = useState(false);
  const [error, setError] = useState("");

  // Seguridad
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [cargandoSecurity, setCargandoSecurity] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (inicializado && !estaAutenticado) {
      router.push("/login");
    }
  }, [inicializado, estaAutenticado, router]);

  // Hidratar formulario con datos del usuario
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre ?? "");
      setEdad(usuario.edad?.toString() ?? "");
      setSexo(usuario.sexo ?? "");
      setCiudad(usuario.ciudad ?? "");
      setLat(usuario.lat ?? null);
      setLng(usuario.lng ?? null);
      setPreferencias(usuario.preferencias ?? []);
    }
  }, [usuario]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ciudadWrapperRef.current &&
        !ciudadWrapperRef.current.contains(e.target as Node)
      ) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filtrar capitales según lo que escribe el usuario (tolerante a tildes)
  const sugerenciasCiudad = useMemo<CapitalRegional[]>(() => {
    const q = normalizar(ciudad);
    if (!q) return CAPITALES_REGIONALES;
    return CAPITALES_REGIONALES.filter(
      (c) =>
        normalizar(c.nombre).includes(q) || normalizar(c.region).includes(q)
    );
  }, [ciudad]);

  const seleccionarCapital = (capital: CapitalRegional) => {
    setCiudad(capital.nombre);
    setLat(capital.lat);
    setLng(capital.lng);
    setMostrarSugerencias(false);
    setIndiceActivo(0);
  };

  useEffect(() => {
    if (seccion === "seguridad" && !securityInfo && !cargandoSecurity) {
      setCargandoSecurity(true);
      fetch("/api/auth/security-info")
        .then((r) => r.json())
        .then((data) => setSecurityInfo(data))
        .catch(() => {})
        .finally(() => setCargandoSecurity(false));
    }
  }, [seccion, securityInfo, cargandoSecurity]);

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

  const guardarPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOkPersonal(false);
    setGuardandoPersonal(true);
    try {
      const ciudadFinal = ciudad.trim();
      let latFinal = lat;
      let lngFinal = lng;

      // Geocodificar si escribió ciudad sin lat/lng
      if (ciudadFinal && (latFinal == null || lngFinal == null)) {
        const geo = await geocodificarTexto(ciudadFinal);
        if (geo) {
          latFinal = geo.lat;
          lngFinal = geo.lng;
          setLat(latFinal);
          setLng(lngFinal);
        }
      }

      await actualizarPerfil({
        nombre: nombre.trim() || undefined,
        edad: edad ? parseInt(edad, 10) : undefined,
        sexo:
          (sexo as
            | "masculino"
            | "femenino"
            | "no_binario"
            | "prefiero_no_decir") || undefined,
        ciudad: ciudadFinal || undefined,
        lat: latFinal ?? undefined,
        lng: lngFinal ?? undefined,
      });

      // Propagar ubicación al store global
      if (ciudadFinal && latFinal != null && lngFinal != null) {
        setManualLocation(latFinal, lngFinal, ciudadFinal);
      }

      setOkPersonal(true);
      setTimeout(() => setOkPersonal(false), 3000);
    } catch {
      setError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setGuardandoPersonal(false);
    }
  };

  const guardarPreferencias = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOkPrefs(false);
    setGuardandoPrefs(true);
    try {
      actualizarPreferencias(preferencias);
      setOkPrefs(true);
      setTimeout(() => setOkPrefs(false), 3000);
    } catch {
      setError("No se pudieron guardar las preferencias.");
    } finally {
      setGuardandoPrefs(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  if (!inicializado || !usuario) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl animate-fade-in">
        {/* Botón volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Encabezado tipo panel */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 flex-shrink-0">
              <span className="font-display text-2xl font-bold text-ink-900">
                {usuario.avatar}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight truncate">
                {usuario.nombre}
              </h1>
              <p className="text-sm text-ink-500 truncate">{usuario.email}</p>
              {usuario.ciudad && (
                <p className="text-xs text-ink-400 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {usuario.ciudad}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Navegación lateral */}
          <aside className="card p-2 h-fit">
            <nav className="space-y-1">
              <button
                onClick={() => setSeccion("personal")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  seccion === "personal"
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "text-ink-600 hover:bg-cream-200"
                )}
              >
                <Settings className="h-4 w-4" />
                Información personal
              </button>
              <button
                onClick={() => setSeccion("preferencias")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  seccion === "preferencias"
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "text-ink-600 hover:bg-cream-200"
                )}
              >
                <Heart className="h-4 w-4" />
                Mis intereses
              </button>
              <button
                onClick={() => setSeccion("seguridad")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  seccion === "seguridad"
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "text-ink-600 hover:bg-cream-200"
                )}
              >
                <Shield className="h-4 w-4" />
                Seguridad
              </button>
              <button
                onClick={handleLogout}
                className="sm:hidden flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </nav>
          </aside>

          {/* Contenido */}
          <section className="card p-6 sm:p-8">
            {seccion === "personal" && (
              <form onSubmit={guardarPersonal} className="space-y-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    Información personal
                  </h2>
                  <p className="text-xs text-ink-500">
                    Modifica tus datos de contacto y ubicación
                  </p>
                </div>

                {/* Email (solo lectura) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <input
                    type="email"
                    value={usuario.email}
                    disabled
                    className={cn(
                      "input-field",
                      "opacity-60 cursor-not-allowed bg-ink-100"
                    )}
                  />
                  <p className="mt-1 text-xs text-ink-400">
                    El email no se puede cambiar
                  </p>
                </div>

                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5"
                  >
                    <UserIcon className="h-3.5 w-3.5" /> Nombre
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="input-field"
                  />
                </div>

                {/* Edad + Género */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edad"
                      className="text-xs font-medium text-ink-500 mb-1.5 block"
                    >
                      Edad
                    </label>
                    <input
                      id="edad"
                      type="number"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      placeholder="Ej: 28"
                      className="input-field"
                      min={1}
                      max={120}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sexo"
                      className="text-xs font-medium text-ink-500 mb-1.5 block"
                    >
                      Género
                    </label>
                    <select
                      id="sexo"
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

                {/* Ciudad */}
                <div>
                  <label
                    htmlFor="ciudad"
                    className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Ciudad
                  </label>
                  <div className="flex gap-2">
                    <div ref={ciudadWrapperRef} className="relative flex-1">
                      <input
                        id="ciudad"
                        type="text"
                        value={ciudad}
                        onChange={(e) => {
                          setCiudad(e.target.value);
                          setLat(null);
                          setLng(null);
                          setMostrarSugerencias(true);
                          setIndiceActivo(0);
                        }}
                        onFocus={() => setMostrarSugerencias(true)}
                        onKeyDown={(e) => {
                          if (!mostrarSugerencias || sugerenciasCiudad.length === 0) return;
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setIndiceActivo((i) =>
                              Math.min(i + 1, sugerenciasCiudad.length - 1)
                            );
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setIndiceActivo((i) => Math.max(i - 1, 0));
                          } else if (e.key === "Enter") {
                            const capital = sugerenciasCiudad[indiceActivo];
                            if (capital) {
                              e.preventDefault();
                              seleccionarCapital(capital);
                            }
                          } else if (e.key === "Escape") {
                            setMostrarSugerencias(false);
                          }
                        }}
                        placeholder="Ej: Concepción"
                        role="combobox"
                        aria-expanded={mostrarSugerencias}
                        aria-autocomplete="list"
                        aria-controls="ciudad-listbox"
                        autoComplete="off"
                        className="input-field w-full"
                      />
                      {mostrarSugerencias && sugerenciasCiudad.length > 0 && (
                        <ul
                          id="ciudad-listbox"
                          role="listbox"
                          className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-ink-200 bg-cream-50 shadow-lg animate-fade-in"
                        >
                          {sugerenciasCiudad.map((capital, i) => {
                            const activo = i === indiceActivo;
                            return (
                              <li
                                key={capital.nombre}
                                role="option"
                                aria-selected={activo}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  seleccionarCapital(capital);
                                }}
                                onMouseEnter={() => setIndiceActivo(i)}
                                className={cn(
                                  "flex items-center justify-between gap-2 px-3 py-2 cursor-pointer",
                                  activo
                                    ? "bg-teal-100 text-teal-800"
                                    : "text-ink-700 hover:bg-cream-200"
                                )}
                              >
                                <span className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-3.5 w-3.5 text-ink-400" />
                                  {capital.nombre}
                                </span>
                                <span className="text-xs text-ink-400">
                                  {capital.region}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {mostrarSugerencias && sugerenciasCiudad.length === 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-ink-200 bg-cream-50 px-3 py-2 text-xs text-ink-500 shadow-lg">
                          Sin coincidencias en las capitales regionales
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={detectarUbicacion}
                      disabled={gpsLoading}
                      title="Detectar mi ubicación"
                      className="px-3 rounded-xl border border-ink-200 text-ink-500 hover:border-teal-400 hover:text-teal-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {gpsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {lat != null && lng != null && (
                    <p className="text-xs text-teal-600 mt-1">
                      Ubicación ({lat.toFixed(3)}, {lng.toFixed(3)})
                    </p>
                  )}
                  <p className="text-xs text-ink-400 mt-1">
                    Todo el sitio se adaptará a esta ubicación
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-red-500 animate-scale-in">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={guardandoPersonal}
                  className="btn-primary w-full py-3"
                >
                  {guardandoPersonal ? (
                    <span className="animate-pulse-soft">Guardando...</span>
                  ) : okPersonal ? (
                    <>
                      <Check className="h-4 w-4" /> Cambios guardados
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar cambios
                    </>
                  )}
                </button>
              </form>
            )}

            {seccion === "seguridad" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    Seguridad de tu cuenta
                  </h2>
                  <p className="text-xs text-ink-500">
                    Elementos criptográficos que protegen tu información
                  </p>
                </div>

                {/* Contraseña / bcrypt */}
                <div className="rounded-2xl border border-ink-200 bg-cream-100 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 border border-teal-200">
                      <Lock className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Contraseña</p>
                      <p className="text-xs text-ink-500">Hash con bcrypt · cost factor 10</p>
                    </div>
                  </div>

                  {cargandoSecurity && (
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <Loader2 className="h-3 w-3 animate-spin" /> Cargando...
                    </div>
                  )}

                  {!cargandoSecurity && securityInfo && (
                    <>
                      {securityInfo.tieneHashBcrypt ? (
                        <div className="space-y-2">
                          <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
                            <p className="text-[10px] font-medium text-teal-600 mb-0.5">Hash almacenado</p>
                            <p className="font-mono text-xs text-teal-800 break-all">
                              {securityInfo.hashParcial}
                            </p>
                          </div>
                          <p className="text-xs text-ink-400">
                            bcrypt es un algoritmo de hash adaptativo basado en Blowfish. El prefijo{" "}
                            <span className="font-mono text-ink-600">$2b$10$</span> indica la versión y el
                            cost factor (2¹⁰ = 1024 iteraciones de hash).
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-ink-200 bg-cream-200 px-3 py-2">
                          <p className="text-xs text-ink-500">
                            {securityInfo.proveedor === "google"
                              ? "Cuenta Google — sin contraseña local. Tu identidad es verificada por OAuth 2.0."
                              : "Sin contraseña local. Acceso via código OTP de un solo uso."}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* JWT */}
                <div className="rounded-2xl border border-ink-200 bg-cream-100 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 border border-amber-200">
                      <Key className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Sesiones</p>
                      <p className="text-xs text-ink-500">JWT firmado con HS256</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="font-mono text-[10px] text-amber-700">
                      header.payload.signature — HMAC-SHA256
                    </p>
                  </div>
                  <p className="text-xs text-ink-400">
                    Los tokens JWT se firman con una clave secreta de 32+ caracteres usando el algoritmo HS256
                    (HMAC-SHA256). Validez de 7 días. Se almacenan en cookies HTTP-only (no accesibles desde JavaScript).
                  </p>
                </div>

                {/* OAuth / OTP */}
                <div className="rounded-2xl border border-ink-200 bg-cream-100 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
                      <Chrome className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Autenticación externa</p>
                      <p className="text-xs text-ink-500">OAuth 2.0 · OTP · TLS</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { label: "Google SSO", desc: "OAuth 2.0 + PKCE via Supabase — el proveedor verifica la identidad" },
                      { label: "OTP por email", desc: "Código HMAC de un solo uso — expira en 60 minutos" },
                      { label: "Transporte", desc: "TLS 1.3 — todas las comunicaciones van cifradas en tránsito" },
                    ].map(({ label, desc }) => (
                      <li key={label} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-ink-700">{label}: </span>
                          <span className="text-xs text-ink-500">{desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {seccion === "preferencias" && (
              <form onSubmit={guardarPreferencias} className="space-y-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    Mis intereses
                  </h2>
                  <p className="text-xs text-ink-500">
                    Selecciona las categorías que más te gustan
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(categoriaLabels).map(([key, label]) => {
                    const seleccionada = preferencias.includes(
                      key as ActivityCategory
                    );
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setPreferencias((prev) =>
                            prev.includes(key as ActivityCategory)
                              ? prev.filter((c) => c !== key)
                              : [...prev, key as ActivityCategory]
                          )
                        }
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                          seleccionada
                            ? "border-teal-400 bg-teal-50 text-teal-700"
                            : "border-ink-200 text-ink-600 hover:border-teal-300 hover:bg-cream-200"
                        )}
                      >
                        {seleccionada && (
                          <Check className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        {label}
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <p className="text-xs text-red-500 animate-scale-in">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={guardandoPrefs}
                  className="btn-primary w-full py-3"
                >
                  {guardandoPrefs ? (
                    <span className="animate-pulse-soft">Guardando...</span>
                  ) : okPrefs ? (
                    <>
                      <Check className="h-4 w-4" /> Preferencias guardadas
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar preferencias
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
