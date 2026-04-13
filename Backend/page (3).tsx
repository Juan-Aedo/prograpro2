"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Filter, X, Star, MapPin } from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatearPrecio, capitalizar } from "@/lib/utils";
import { CrowdIndicator } from "@/components/CrowdIndicator";

// Importación dinámica para evitar SSR de Leaflet
const ActivityMap = dynamic(() => import("@/components/ActivityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-surface-100">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-surface-500">Cargando mapa…</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [actividades, setActividades] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities?pageSize=50")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setActividades(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 border-r border-surface-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-surface-100">
          <p className="text-sm font-semibold text-surface-900">
            {actividades.length} actividades en el mapa
          </p>
        </div>
        <div className="p-3 space-y-2">
          {actividades.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={`w-full text-left rounded-xl p-3 transition-all duration-150 border ${
                selected?.id === a.id
                  ? "border-brand-400 bg-brand-50"
                  : "border-surface-100 hover:border-surface-200 hover:bg-surface-50"
              }`}
            >
              <p className="text-sm font-medium text-surface-900 line-clamp-1">
                {a.nombre}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-surface-500">{capitalizar(a.categoria)}</span>
                <span className="text-xs font-semibold text-brand-600">
                  {formatearPrecio(a.precio.valor, a.precio.moneda)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ActivityMap
            actividades={actividades}
            selected={selected}
            onSelect={setSelected}
          />
        )}

        {/* Panel detalle flotante */}
        {selected && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 md:bottom-4 w-80 bg-white rounded-2xl shadow-elevated border border-surface-200 p-4 z-50">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-surface-400 hover:text-surface-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pr-6">
              <p className="text-sm font-semibold text-surface-900 leading-snug">
                {selected.nombre}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-surface-500 mt-1">
                <MapPin className="h-3 w-3" />
                {selected.ubicacion.direccion}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-bold text-brand-700">
                  {formatearPrecio(selected.precio.valor, selected.precio.moneda)}
                </span>
                <div className="flex items-center gap-1 text-xs text-surface-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {selected.rating}
                </div>
                <CrowdIndicator nivel={selected.afluencia} compacto />
              </div>
              {!selected.cuposDisponibles && (
                <p className="text-xs font-medium text-red-600 mt-1">⛔ Agotado</p>
              )}
              <a
                href={`/activity/${selected.id}`}
                className="btn-primary text-xs mt-3 w-full justify-center"
              >
                Ver detalles y reservar
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
