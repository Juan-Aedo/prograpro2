"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookMarked } from "lucide-react";
import { useWeather } from "@/lib/hooks/useWeather";
import { sugerirPorClima } from "@/lib/weather";
import { useLocationStore } from "@/store/locationStore";
import { ActivityCard } from "@/components/ActivityCard";
import { capitalMasCercana, actividadesFallback } from "@/lib/capitalesRegionales";
import type { Activity } from "@/lib/types";

export function RecomendadasPorClima() {
  const { clima, loading: climaLoading } = useWeather();
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);
  const ciudad = useLocationStore((s) => s.ciudad);
  const [actividades, setActividades] = useState<Activity[]>([]);
  const [loadingActs, setLoadingActs] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);

  // Fallback: actividades predefinidas para la capital regional más cercana
  const fallback = useMemo(() => {
    const capital = capitalMasCercana(lat, lng);
    const todas = actividadesFallback(capital.nombre);
    // Filtrar por categorías sugeridas por clima cuando ya tengamos el dato
    const filtradas = categorias.length > 0
      ? todas.filter((a) => categorias.includes(a.categoria))
      : todas;
    return {
      capital,
      actividades: filtradas.length > 0 ? filtradas : todas,
    };
  }, [lat, lng, categorias]);

  useEffect(() => {
    if (!clima) return;

    const cats = sugerirPorClima(clima);
    setCategorias(cats);
    setLoadingActs(true);

    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat,
        lng,
        preferencias: cats,
        radio: 100_000,
        limite: 4,
      }),
    })
      .then((r) => r.json())
      .then((data) => setActividades(Array.isArray(data.actividades) ? data.actividades : []))
      .catch(() => setActividades([]))
      .finally(() => setLoadingActs(false));
  // Re-ejecutar cuando cambia ubicación, tipo de clima o temperatura en intervalos de 5°C
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, clima?.icono, clima ? Math.floor(clima.temperatura / 5) : 0]);

  const loading = climaLoading || loadingActs;

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
        (() => {
          const esFallbackDiferente =
            fallback.capital.nombre.toLowerCase() !== ciudad.toLowerCase();
          return (
            <>
              {esFallbackDiferente && (
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
                  <ActivityCard
                    key={actividad.id}
                    actividad={actividad}
                    indice={i}
                  />
                ))}
              </div>
            </>
          );
        })()
      )}
    </section>
  );
}
