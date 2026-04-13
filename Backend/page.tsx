import { obtenerClima } from "@/lib/weather";
import { getActividades, CATEGORIAS } from "@/lib/data";
import { topRecomendaciones } from "@/lib/recommendations";
import { HomeHero } from "@/components/HomeHero";
import { CategoryScroller } from "@/components/CategoryScroller";
import { ActivityCard } from "@/components/ActivityCard";
import type { UserPreferences } from "@/lib/types";

// Preferencias default (sin sesión activa)
const DEFAULT_PREFS: UserPreferences = {
  categorias: ["parques", "gastronomia", "museos", "aire-libre", "talleres"],
  presupuesto: "medio",
  evitar: [],
  prefiereExterior: true,
};

export default async function HomePage() {
  // Data fetching server-side
  const [clima, actividades] = await Promise.all([
    obtenerClima(),
    Promise.resolve(getActividades()),
  ]);

  const recomendadas = topRecomendaciones(actividades, clima, DEFAULT_PREFS, 6);

  // Actividades gratis de hoy
  const gratis = actividades
    .filter((a) => a.precio.valor === 0 && a.cuposDisponibles)
    .slice(0, 4);

  // Tendencias
  const tendencias = actividades
    .filter((a) => a.enTendencia && a.cuposDisponibles)
    .slice(0, 4);

  return (
    <main className="pb-20 md:pb-0">
      {/* Hero con búsqueda y clima */}
      <HomeHero clima={clima} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Categorías */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-surface-900 mb-4">
            Explorar por categoría
          </h2>
          <CategoryScroller categorias={CATEGORIAS} />
        </section>

        {/* Recomendadas del día */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-surface-900">
                Recomendadas para hoy
              </h2>
              <p className="text-sm text-surface-500 mt-0.5">
                Basadas en el clima, tus preferencias y disponibilidad
              </p>
            </div>
            <a
              href="/explore"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Ver todas →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recomendadas.map((actividad, i) => (
              <ActivityCard
                key={actividad.id}
                actividad={actividad}
                indice={i}
              />
            ))}
          </div>
        </section>

        {/* Gratis hoy */}
        {gratis.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-surface-900">
                🎁 Gratis hoy
              </h2>
              <a
                href="/explore?soloGratis=true"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver todas →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gratis.map((actividad, i) => (
                <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
              ))}
            </div>
          </section>
        )}

        {/* Tendencias */}
        {tendencias.length > 0 && (
          <section className="mt-10 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-surface-900">
                🔥 En tendencia
              </h2>
              <a
                href="/explore?soloTendencia=true"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver todas →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tendencias.map((actividad, i) => (
                <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
