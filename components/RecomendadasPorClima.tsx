"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookMarked } from "lucide-react";
import { useWeather } from "@/lib/hooks/useWeather";
import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { sugerirPorClima } from "@/lib/weather";
import { useLocationStore } from "@/store/locationStore";
import { ActivityCard } from "@/components/ActivityCard";
import {
  actividadesFallback,
  fallbackActividadesPara,
} from "@/lib/capitalesRegionales";
import type { ActivityCategory } from "@/lib/types";

export function RecomendadasPorClima() {
  const { clima, loading: climaLoading } = useWeather();
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);
  const ciudad = useLocationStore((s) => s.ciudad);
  const { data, loading: recLoading, fetch: fetchRec } = useRecommendations();
  const lastKey = useRef<string>("");

  const categorias = useMemo<ActivityCategory[]>(
    () => (clima ? (sugerirPorClima(clima) as ActivityCategory[]) : []),
    [clima]
  );

  // Fallback: actividades predefinidas, opcionalmente filtradas por categorías sugeridas
  const fallback = useMemo(() => {
    const r = fallbackActividadesPara(lat, lng, { categorias });
    // Si el filtro por categorías deja vacío, mostrar todas las de la capital
    if (r.actividades.length === 0) {
      return { capital: r.capital, actividades: actividadesFallback(r.capital.nombre) };
    }
    return r;
  }, [lat, lng, categorias]);

  useEffect(() => {
    if (!clima) return;
    // Re-ejecutar cuando cambia ubicación, tipo de clima o temperatura en intervalos de 5°C
    const tempBucket = Math.floor(clima.temperatura / 5);
    const key = `${lat}|${lng}|${clima.icono}|${tempBucket}|${categorias.join(",")}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    fetchRec({ lat, lng, preferencias: categorias, radio: 100_000, limite: 4 });
  }, [lat, lng, clima, categorias, fetchRec]);

  const actividades = data?.actividades ?? [];
  const loading = climaLoading || (recLoading && !data);

  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Según el clima de hoy
          </p>
          <h2 className="section-title">Recomendadas para ti</h2>
          <p className="section-subtitle mt-1">
            {clima
              ? `${clima.temperatura}°C · ${clima.descripcion} en ${clima.ciudad} — ${categorias.slice(0, 3).join(", ")}`
              : "Cargando clima de tu ubicación..."}
          </p>
        </div>
        <Link
          href={`/explore?lat=${lat}&lng=${lng}&ciudad=${encodeURIComponent(ciudad)}`}
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
        >
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-cream-200" />
          ))}
        </div>
      ) : actividades.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-stagger">
          {actividades.map((actividad, i) => (
            <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
          ))}
        </div>
      ) : (
        <>
          {fallback.capital.nombre.toLowerCase() !== ciudad.toLowerCase() && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <BookMarked className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Sin actividades registradas para las condiciones actuales en{" "}
                <strong>{ciudad}</strong>. Mostrando sugerencias para{" "}
                <strong>{fallback.capital.nombre}</strong>.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
            {fallback.actividades.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
