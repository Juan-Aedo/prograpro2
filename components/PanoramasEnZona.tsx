"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapPin, Loader2, BookMarked } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import { useUserStore } from "@/store/userStore";
import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { ActivityCard } from "@/components/ActivityCard";
import { fallbackActividadesPara } from "@/lib/capitalesRegionales";
import { iconoParaClima } from "@/lib/iconMap";

export function PanoramasEnZona() {
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);
  const ciudad = useLocationStore((s) => s.ciudad);
  const modo = useLocationStore((s) => s.modo);
  const preferencias = useUserStore((s) => s.usuario?.preferencias ?? []);

  const { data, loading, error, fetch: fetchRec } = useRecommendations();
  const lastKey = useRef<string>("");

  // Fallback: actividades predefinidas para la capital regional más cercana
  const fallback = useMemo(() => fallbackActividadesPara(lat, lng), [lat, lng]);

  useEffect(() => {
    const key = `${lat}|${lng}|${preferencias.join(",")}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    fetchRec({
      lat,
      lng,
      preferencias,
      radio: 100_000,
      limite: 8,
    });
  }, [lat, lng, preferencias, fetchRec]);

  const clima = data?.clima;
  const IconoClima = iconoParaClima(clima?.icono);

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {modo === "manual" ? "Ubicación manual" : modo === "gps" ? "Cerca de ti" : "Tu zona"}
          </p>
          <h2 className="section-title">Panoramas en {ciudad}</h2>

          {/* Contexto climático */}
          {clima ? (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-sm text-ink-500">
                <IconoClima className="h-4 w-4 text-amber-500" />
                {clima.temperatura}°C · {clima.descripcion}
              </span>
              {data && data.filtradasPorClima > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  {data.filtradasPorClima} actividades al aire libre no recomendadas hoy
                </span>
              )}
            </div>
          ) : (
            <p className="section-subtitle mt-1">
              Actividades en tu zona según el clima y tus preferencias
            </p>
          )}
        </div>
      </div>

      {loading && !data && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-cream-200" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && data.actividades.length === 0 && (() => {
        const esFallbackDiferente = fallback.capital.nombre.toLowerCase() !== ciudad.toLowerCase();
        return (
          <>
            {esFallbackDiferente && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <BookMarked className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Sin actividades registradas en tu zona. Mostrando sugerencias para{" "}
                  <strong>{fallback.capital.nombre}</strong>.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
              {fallback.actividades.map((a, i) => (
                <ActivityCard key={a.id} actividad={a} indice={i} />
              ))}
            </div>
          </>
        );
      })()}

      {data && data.actividades.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-stagger">
            {data.actividades.map((a, i) => (
              <ActivityCard
                key={a.id}
                actividad={a}
                indice={i}
                razonRecomendacion={a.razonRecomendacion}
              />
            ))}
          </div>
          {loading && (
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Actualizando...
            </p>
          )}
        </>
      )}
    </section>
  );
}
