import { Suspense } from "react";
import { actividades, climaMock } from "@/lib/mock-data";
import { categoriaLabels } from "@/lib/mock-data";
import { ActivityCard } from "@/components/ActivityCard";
import { WeatherBadge } from "@/components/WeatherBadge";
import { HomeHero } from "@/components/HomeHero";
import { CategoryScroller } from "@/components/CategoryScroller";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Actividades destacadas y en tendencia
const destacadas = actividades.filter((a) => a.destacada);
const enTendencia = actividades.filter((a) => a.enTendencia);

// Categorías únicas
const categorias = Object.entries(categoriaLabels);

export default function HomePage() {
  return (
    <div className="pb-24 md:pb-8">
      {/* Hero */}
      <HomeHero clima={climaMock} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 mt-8">
        {/* Categorías scroll horizontal */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Categorías</h2>
            <Link
              href="/explore"
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors duration-200 cursor-pointer"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CategoryScroller categorias={categorias} />
        </section>

        {/* En tendencia */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-coral-500" />
            <h2 className="section-title">En Tendencia</h2>
          </div>
          <p className="section-subtitle mb-5">
            Lo más popular entre los usuarios esta semana
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-stagger">
            {enTendencia.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        </section>

        {/* Recomendados para ti */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h2 className="section-title">Recomendados para ti</h2>
          </div>
          <p className="section-subtitle mb-5">
            Basado en tus preferencias y el clima actual
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-stagger">
            {destacadas.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        </section>

        {/* Sección clima + CTA */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Suspense
            fallback={
              <div className="card p-5 animate-pulse h-52 bg-surface-100" />
            }
          >
            <WeatherBadge clima={climaMock} />
          </Suspense>

          <div className="card p-6 flex flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 border-none text-white">
            <div>
              <h3 className="text-lg font-bold">
                Descubre actividades cerca de ti
              </h3>
              <p className="mt-2 text-sm text-brand-100">
                Activa tu ubicación para ver recomendaciones personalizadas
                según tu zona, el clima y tus preferencias.
              </p>
            </div>
            <Link
              href="/map"
              className="mt-4 inline-flex items-center gap-2 self-start rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-all duration-200 hover:bg-brand-50 hover:shadow-lg cursor-pointer"
            >
              Abrir Mapa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
