import { Suspense } from "react";
import { getActividades } from "@/lib/data";
import { filtrarActividades, calcularScore } from "@/lib/recommendations";
import { obtenerClima } from "@/lib/weather";
import { ActivityCard } from "@/components/ActivityCard";
import type { ActivityFilters, UserPreferences } from "@/lib/types";

const DEFAULT_PREFS: UserPreferences = {
  categorias: ["parques", "gastronomia", "museos", "aire-libre", "talleres"],
  presupuesto: "medio",
  evitar: [],
  prefiereExterior: true,
};

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const filtros: ActivityFilters = {
    categoria: searchParams.categoria as any,
    search: searchParams.q,
    soloGratis: searchParams.soloGratis === "true",
    soloDisponibles: searchParams.soloDisponibles === "true",
    soloAptoClima: searchParams.soloAptoClima === "true",
    soloTendencia: searchParams.soloTendencia === "true",
    sortBy: (searchParams.sortBy as any) ?? "rec",
    pageSize: 50,
  };

  const [clima, actividades] = await Promise.all([
    obtenerClima(),
    Promise.resolve(getActividades()),
  ]);

  const resultado = filtrarActividades(actividades, filtros, clima, DEFAULT_PREFS);

  const conScore = resultado.map((a) => ({
    ...a,
    recScore: calcularScore(a, clima, DEFAULT_PREFS).score,
  }));

  const titulo = filtros.categoria
    ? `${filtros.categoria.charAt(0).toUpperCase() + filtros.categoria.slice(1).replace("-", " ")}`
    : filtros.search
    ? `Resultados para "${filtros.search}"`
    : "Explorar actividades";

  return (
    <main className="pb-24 md:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900">{titulo}</h1>
          <p className="text-sm text-surface-500 mt-1">
            {conScore.length} actividades encontradas · Clima:{" "}
            {clima.temperatura}°C, {clima.descripcion}
          </p>
        </div>

        {/* Chips de filtros activos */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filtros.soloGratis && (
            <span className="badge bg-emerald-100 text-emerald-700">✓ Gratis</span>
          )}
          {filtros.soloDisponibles && (
            <span className="badge bg-blue-100 text-blue-700">✓ Con cupos</span>
          )}
          {filtros.soloAptoClima && (
            <span className="badge bg-amber-100 text-amber-700">✓ Apto al clima</span>
          )}
          {filtros.soloTendencia && (
            <span className="badge bg-fuchsia-100 text-fuchsia-700">✓ En tendencia</span>
          )}
        </div>

        {conScore.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <span className="text-5xl">🔍</span>
            <p className="text-surface-500 text-center">
              No encontramos actividades con estos filtros.
              <br />
              <a href="/explore" className="text-brand-600 hover:underline">
                Ver todas las actividades
              </a>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {conScore.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
