"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, List, Grid3X3 } from "lucide-react";
import { categoriaLabels } from "@/lib/categorias";
import { ActivityCard } from "@/components/ActivityCard";
import { cn } from "@/lib/utils";
import type { Activity, ActivityCategory } from "@/lib/types";
import Link from "next/link";

export default function MapPage() {
  const [actividades, setActividades] = useState<Activity[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<ActivityCategory | null>(null);
  const [vistaLista, setVistaLista] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function cargar() {
      setCargando(true);
      try {
        const res = await fetch("/api/activities", { cache: "no-store" });
        if (!res.ok) return;
        const data: Activity[] = await res.json();
        if (!cancelled) setActividades(data);
      } finally {
        if (!cancelled) setCargando(false);
      }
    }
    cargar();
    return () => { cancelled = true; };
  }, []);

  const actividadesFiltradas = categoriaSeleccionada
    ? actividades.filter((a) => a.categoria === categoriaSeleccionada)
    : actividades;

  return (
    <div className="pb-24 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">Explorar</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
              Mapa de Actividades
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {cargando ? "Cargando..." : `${actividadesFiltradas.length} actividades cerca de ti`}
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full border border-ink-200 bg-cream-200">
            <button
              onClick={() => setVistaLista(false)}
              className={cn(
                "p-2 rounded-full transition-all duration-150 cursor-pointer",
                !vistaLista ? "bg-teal-400 text-ink-900 border border-ink-900/20" : "text-ink-400 hover:text-ink-700"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVistaLista(true)}
              className={cn(
                "p-2 rounded-full transition-all duration-150 cursor-pointer",
                vistaLista ? "bg-teal-400 text-ink-900 border border-ink-900/20" : "text-ink-400 hover:text-ink-700"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <button
            onClick={() => setCategoriaSeleccionada(null)}
            className={cn(
              "badge cursor-pointer transition-all duration-150 whitespace-nowrap",
              !categoriaSeleccionada
                ? "bg-teal-400 text-ink-900 border border-ink-900"
                : "bg-cream-200 text-ink-600 border border-ink-200 hover:border-ink-400"
            )}
          >
            Todas
          </button>
          {Object.entries(categoriaLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategoriaSeleccionada(key as ActivityCategory)}
              className={cn(
                "badge cursor-pointer transition-all duration-150 whitespace-nowrap",
                categoriaSeleccionada === key
                  ? "bg-teal-400 text-ink-900 border border-ink-900"
                  : "bg-cream-200 text-ink-600 border border-ink-200 hover:border-ink-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mapa placeholder */}
        <div className="overflow-hidden rounded-2xl border border-ink-900/10 bg-cream-200">
          <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-cream-200 via-teal-100/40 to-cream-300">
            {/* Grid decorativo */}
            <div className="absolute inset-0 opacity-15">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="mapGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />
              </svg>
            </div>

            {/* Pins */}
            <div className="absolute inset-0 p-8">
              {actividadesFiltradas.slice(0, 6).map((act, i) => {
                const positions = [
                  { top: "20%", left: "25%" }, { top: "35%", left: "55%" },
                  { top: "60%", left: "35%" }, { top: "45%", left: "75%" },
                  { top: "70%", left: "60%" }, { top: "25%", left: "80%" },
                ];
                const pos = positions[i] ?? positions[0];
                return (
                  <Link key={act.id} href={`/activity/${act.id}`} className="absolute group cursor-pointer" style={{ top: pos.top, left: pos.left }}>
                    <div className="relative">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-400 border border-ink-900 shadow-offset-sm transition-all duration-150 group-hover:scale-125">
                        <MapPin className="h-4 w-4 text-ink-900" />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="rounded-xl bg-cream-100 border border-ink-900/15 px-3 py-2 shadow-offset-sm whitespace-nowrap">
                          <p className="text-xs font-semibold text-ink-900">
                            {act.nombre.length > 30 ? act.nombre.slice(0, 30) + "..." : act.nombre}
                          </p>
                          <p className="text-[10px] text-ink-500">{act.ubicacion.direccion}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-25" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Indicador central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="rounded-2xl border border-ink-900/10 bg-cream-100/90 backdrop-blur-sm px-6 py-4 shadow-offset-sm text-center">
                <Navigation className="h-6 w-6 text-teal-500 mx-auto mb-2" />
                <p className="font-display text-sm font-bold text-ink-900">Mapa Interactivo</p>
                <p className="text-xs text-ink-500 mt-0.5">Requiere Google Maps API Key</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div>
          <h2 className="section-title mb-5">Actividades en el Mapa</h2>
          <div className={cn(
            "gap-5 animate-stagger",
            vistaLista ? "flex flex-col" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}>
            {actividadesFiltradas.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
