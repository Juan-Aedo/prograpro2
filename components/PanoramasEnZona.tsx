"use client";

import { useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import { useUserStore } from "@/store/userStore";
import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { ActivityCard } from "@/components/ActivityCard";

export function PanoramasEnZona() {
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);
  const ciudad = useLocationStore((s) => s.ciudad);
  const modo = useLocationStore((s) => s.modo);
  const preferencias = useUserStore((s) => s.usuario?.preferencias ?? []);

  const { data, loading, error, fetch: fetchRec } = useRecommendations();
  const lastKey = useRef<string>("");

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

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {modo === "manual" ? "Modo VPN" : modo === "gps" ? "Cerca de ti" : "Por defecto"}
          </p>
          <h2 className="section-title">Panoramas en {ciudad}</h2>
          <p className="section-subtitle mt-1">
            Actividades en tu zona según el clima y tus preferencias
          </p>
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

      {data && data.actividades.length === 0 && (
        <div className="rounded-2xl border border-ink-200 bg-cream-200 p-8 text-center">
          <p className="text-sm text-ink-500">
            No hay panoramas dentro del radio en {ciudad}. Prueba ampliando la zona o cambiando
            tu ubicación.
          </p>
        </div>
      )}

      {data && data.actividades.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-stagger">
            {data.actividades.map((a, i) => (
              <ActivityCard key={a.id} actividad={a} indice={i} />
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
