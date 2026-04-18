"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Star, ArrowUpDown, BookMarked } from "lucide-react";
import { categoriaLabels } from "@/lib/categorias";
import { ActivityCard } from "@/components/ActivityCard";
import { cn } from "@/lib/utils";
import { calcularDistanciaKm } from "@/lib/maps";
import { fallbackActividadesPara } from "@/lib/capitalesRegionales";
import type { Activity, ActivityCategory } from "@/lib/types";

// Radio máximo (km) para considerar una actividad "en tu zona" cuando viene lat/lng.
const RADIO_ZONA_KM = 100;

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 w-64 rounded-lg bg-cream-300 animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card h-72 animate-pulse bg-cream-200" />
        ))}
      </div>
    </div>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const categoriaInicial = searchParams.get("categoria") as ActivityCategory | null;
  const busquedaInicial = searchParams.get("q") ?? "";
  const latParam = parseFloat(searchParams.get("lat") ?? "");
  const lngParam = parseFloat(searchParams.get("lng") ?? "");
  const ciudadParam = searchParams.get("ciudad") ?? "";
  const precioParam = searchParams.get("precio"); // "gratis" | null
  const tieneUbicacion = !isNaN(latParam) && !isNaN(lngParam);

  const [actividades, setActividades] = useState<Activity[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<ActivityCategory[]>(
    categoriaInicial ? [categoriaInicial] : []
  );
  const [soloDestacadas, setSoloDestacadas] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState<"relevancia" | "precio" | "rating">("relevancia");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function cargar() {
      setCargando(true);
      try {
        const res = await fetch("/api/activities", { cache: "no-store" });
        if (!res.ok) throw new Error("Error al cargar");
        const data: Activity[] = await res.json();
        if (!cancelled) setActividades(data);
      } finally {
        if (!cancelled) setCargando(false);
      }
    }
    cargar();
    return () => { cancelled = true; };
  }, []);

  const toggleCategoria = (cat: ActivityCategory) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const resultados = useMemo(() => {
    let filtradas = [...actividades];
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtradas = filtradas.filter(
        (a) =>
          a.nombre.toLowerCase().includes(termino) ||
          a.descripcion.toLowerCase().includes(termino) ||
          a.tags.some((t) => t.toLowerCase().includes(termino)) ||
          a.ubicacion.direccion.toLowerCase().includes(termino)
      );
    }
    if (categoriasSeleccionadas.length > 0) {
      filtradas = filtradas.filter((a) => categoriasSeleccionadas.includes(a.categoria));
    }
    if (soloDestacadas) filtradas = filtradas.filter((a) => a.destacada);
    // Filtro "Gratis" desde quickTag
    if (precioParam === "gratis") filtradas = filtradas.filter((a) => a.precio.valor === 0);
    // Filtro por zona cuando viene lat/lng: solo actividades dentro del radio
    if (tieneUbicacion) {
      filtradas = filtradas.filter(
        (a) =>
          calcularDistanciaKm(latParam, lngParam, a.ubicacion.lat, a.ubicacion.lng) <=
          RADIO_ZONA_KM
      );
    }
    // Ordenamiento
    if (ordenarPor === "precio") {
      filtradas.sort((a, b) => a.precio.valor - b.precio.valor);
    } else if (ordenarPor === "rating") {
      filtradas.sort((a, b) => b.rating - a.rating);
    } else if (tieneUbicacion) {
      // Ordenar por proximidad cuando viene lat/lng en la URL
      filtradas.sort((a, b) => {
        const da = calcularDistanciaKm(latParam, lngParam, a.ubicacion.lat, a.ubicacion.lng);
        const db = calcularDistanciaKm(latParam, lngParam, b.ubicacion.lat, b.ubicacion.lng);
        return da - db;
      });
    }
    return filtradas;
  }, [actividades, busqueda, categoriasSeleccionadas, soloDestacadas, ordenarPor, precioParam, tieneUbicacion, latParam, lngParam]);

  // Fallback regional cuando viene lat/lng y no hay resultados en la DB dentro del radio.
  const fallback = useMemo(() => {
    if (!tieneUbicacion) return null;
    return fallbackActividadesPara(latParam, lngParam, {
      busqueda,
      categorias: categoriasSeleccionadas,
      precioGratis: precioParam === "gratis",
    });
  }, [tieneUbicacion, latParam, lngParam, busqueda, categoriasSeleccionadas, precioParam]);

  const mostrandoFallback = tieneUbicacion && resultados.length === 0 && !!fallback && fallback.actividades.length > 0;
  const ciudadEtiqueta = ciudadParam || (fallback ? fallback.capital.nombre : "");

  const filtrosActivos = categoriasSeleccionadas.length > 0 || soloDestacadas || busqueda.trim();

  return (
    <div className="pb-24 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Encabezado */}
        <div>
          <p className="eyebrow mb-1">Explorar</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            {tieneUbicacion && ciudadEtiqueta
              ? `Actividades en ${ciudadEtiqueta}`
              : "Todas las Actividades"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {cargando
              ? "Cargando..."
              : mostrandoFallback
              ? `${fallback!.actividades.length} sugerencias para ${fallback!.capital.nombre}`
              : `${resultados.length} actividades disponibles${
                  tieneUbicacion ? " en tu zona" : ""
                }`}
          </p>
        </div>

        {/* Barra de búsqueda + filtros */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar actividades..."
              className="w-full rounded-full border border-ink-900/15 bg-white px-4 py-2.5 pl-10 text-sm text-ink-900 placeholder:text-ink-400 transition-all duration-150 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={cn(
              "btn-secondary relative py-2.5 px-5",
              mostrarFiltros && "bg-teal-100 border-teal-400 text-teal-700"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {filtrosActivos && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-teal-400 border border-ink-900 text-[10px] font-bold text-ink-900 flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          mostrarFiltros ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="card p-5 space-y-5">
            <div>
              <p className="text-sm font-semibold text-ink-700 mb-3">Categorías</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoriaLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleCategoria(key as ActivityCategory)}
                    className={cn(
                      "badge cursor-pointer transition-all duration-150",
                      categoriasSeleccionadas.includes(key as ActivityCategory)
                        ? "bg-teal-400 text-ink-900 border border-ink-900"
                        : "bg-cream-200 text-ink-600 border border-ink-200 hover:border-ink-400"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setSoloDestacadas(!soloDestacadas)}
                className={cn(
                  "badge cursor-pointer transition-all duration-150",
                  soloDestacadas
                    ? "bg-teal-100 text-teal-700 border border-teal-300"
                    : "bg-cream-200 text-ink-600 border border-ink-200 hover:border-ink-400"
                )}
              >
                <Star className="h-3 w-3" />
                Solo destacadas
              </button>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-ink-400" />
                <select
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value as "relevancia" | "precio" | "rating")}
                  className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                >
                  <option value="relevancia">Relevancia</option>
                  <option value="precio">Menor precio</option>
                  <option value="rating">Mejor valoradas</option>
                </select>
              </div>

              {filtrosActivos && (
                <button
                  onClick={() => { setCategoriasSeleccionadas([]); setSoloDestacadas(false); setBusqueda(""); setOrdenarPor("relevancia"); }}
                  className="text-xs font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-cream-200" />
            ))}
          </div>
        ) : resultados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-stagger">
            {resultados.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        ) : mostrandoFallback ? (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <BookMarked className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Sin actividades registradas en{" "}
                <strong>{ciudadEtiqueta || fallback!.capital.nombre}</strong>. Mostrando sugerencias
                para <strong>{fallback!.capital.nombre}</strong>.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
              {fallback!.actividades.map((actividad, i) => (
                <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-ink-300 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700">No se encontraron actividades</h3>
            <p className="mt-1 text-sm text-ink-400 max-w-sm">
              Intenta cambiar los filtros o buscar con otros términos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
