"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Save, Loader2, Check } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useLocationStore } from "@/store/locationStore";
import { categoriaLabels } from "@/lib/categorias";
import type { ActivityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { usuario, estaAutenticado, inicializado, actualizarPerfil, actualizarPreferencias } = useUserStore();
  const setManualLocation = useLocationStore((s) => s.setManual);

  const [nombre, setNombre] = useState("");
  const [edad, setEdad]     = useState<string>("");
  const [sexo, setSexo]     = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");
  const [lat, setLat]       = useState<number | null>(null);
  const [lng, setLng]       = useState<number | null>(null);

  const [preferencias, setPreferencias] = useState<ActivityCategory[]>([]);
  const [cargando, setCargando]   = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [guardado, setGuardado]   = useState(false);
  const [error, setError]         = useState("");

  // Redirigir si no está autenticado (solo después de resolver la sesión)
  useEffect(() => {
    if (inicializado && !estaAutenticado) {
      router.push("/login");
    }
  }, [inicializado, estaAutenticado, router]);

  // Poblar campos con datos del usuario
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

  const detectarUbicacion = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setGpsLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          const addr = data.address;
          const nombreCiudad =
            addr?.city ?? addr?.town ?? addr?.village ?? addr?.county ?? "";
          setCiudad(nombreCiudad);
        } catch {
          // coordenadas disponibles aunque falle el nombre
        }
        setGpsLoading(false);
      },
      () => {
        setError("No se pudo obtener tu ubicación. Escríbela manualmente.");
        setGpsLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardado(false);
    setCargando(true);
    try {
      const ciudadFinal = ciudad.trim();
      let latFinal = lat;
      let lngFinal = lng;

      // Si escribió una ciudad manualmente sin GPS, geocodificarla
      if (ciudadFinal && (latFinal == null || lngFinal == null)) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(ciudadFinal)}`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          if (Array.isArray(data) && data[0]) {
            latFinal = parseFloat(data[0].lat);
            lngFinal = parseFloat(data[0].lon);
            setLat(latFinal);
            setLng(lngFinal);
          }
        } catch {
          // si falla, guardamos solo el texto de la ciudad
        }
      }

      await actualizarPerfil({
        nombre: nombre.trim() || undefined,
        edad: edad ? parseInt(edad, 10) : undefined,
        sexo: (sexo as "masculino" | "femenino" | "no_binario" | "prefiero_no_decir") || undefined,
        ciudad: ciudadFinal || undefined,
        lat: latFinal ?? undefined,
        lng: lngFinal ?? undefined,
      });
      actualizarPreferencias(preferencias);

      // Propagar ubicación al store global para que toda la página reaccione
      if (ciudadFinal && latFinal != null && lngFinal != null) {
        setManualLocation(latFinal, lngFinal, ciudadFinal);
      }

      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch {
      setError("No se pudo guardar los cambios. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (!inicializado || !usuario) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Cabecera */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/20 mb-4">
            <span className="font-display text-2xl font-bold text-ink-900">
              {usuario.avatar}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
            Mi perfil
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Edita tus datos personales y ubicación
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (solo lectura) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <input
                type="email"
                value={usuario.email}
                disabled
                className={cn("input-field", "opacity-60 cursor-not-allowed bg-ink-100")}
              />
              <p className="mt-1 text-xs text-ink-400">El email no se puede cambiar</p>
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                <User className="h-3.5 w-3.5" /> Nombre
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
                <label htmlFor="edad" className="text-xs font-medium text-ink-500 mb-1.5 block">
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
                <label htmlFor="sexo" className="text-xs font-medium text-ink-500 mb-1.5 block">
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
              <label htmlFor="ciudad" className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
                <MapPin className="h-3.5 w-3.5" /> Ciudad predeterminada
              </label>
              <div className="flex gap-2">
                <input
                  id="ciudad"
                  type="text"
                  value={ciudad}
                  onChange={(e) => { setCiudad(e.target.value); setLat(null); setLng(null); }}
                  placeholder="Ej: Santiago de Chile"
                  className="input-field flex-1"
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
                  Ubicación GPS ({lat.toFixed(3)}, {lng?.toFixed(3)})
                </p>
              )}
            </div>

            {/* Preferencias */}
            <div>
              <p className="text-xs font-medium text-ink-500 mb-2">Mis intereses</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(categoriaLabels).map(([key, label]) => (
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
                      preferencias.includes(key as ActivityCategory)
                        ? "border-teal-400 bg-teal-50 text-teal-700"
                        : "border-ink-200 text-ink-600 hover:border-teal-300 hover:bg-cream-200"
                    )}
                  >
                    {preferencias.includes(key as ActivityCategory) && (
                      <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 animate-scale-in">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="btn-primary w-full py-3"
            >
              {cargando ? (
                <span className="animate-pulse-soft">Guardando...</span>
              ) : guardado ? (
                <> <Check className="h-4 w-4" /> Cambios guardados </>
              ) : (
                <> <Save className="h-4 w-4" /> Guardar cambios </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}