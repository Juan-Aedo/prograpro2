import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { serializeActivity } from "@/lib/serializers";
import { obtenerClima } from "@/lib/weather";
import { categoriaLabels } from "@/lib/categorias";
import { ActivityCard } from "@/components/ActivityCard";
import { WeatherLive } from "@/components/WeatherLive";
import { HomeHero } from "@/components/HomeHero";
import { PanoramasEnZona } from "@/components/PanoramasEnZona";
import { CategoryScroller } from "@/components/CategoryScroller";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [destacadasRows, enTendenciaRows, clima] = await Promise.all([
    prisma.activity.findMany({ where: { destacada: true }, orderBy: { createdAt: "asc" } }),
    prisma.activity.findMany({ where: { enTendencia: true }, orderBy: { createdAt: "asc" } }),
    obtenerClima(),
  ]);

  const destacadas = destacadasRows.map(serializeActivity);
  const enTendencia = enTendenciaRows.map(serializeActivity);
  const categorias = Object.entries(categoriaLabels);

  return (
    <div className="pb-24 md:pb-8">
      {/* Hero */}
      <HomeHero clima={clima} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 space-y-16">

        {/* ——— Categorías — Marquee ——— */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="eyebrow mb-1">Explora</p>
              <h2 className="section-title">Por categoría</h2>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CategoryScroller categorias={categorias} />
        </section>

        <hr className="border-none h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

        {/* ——— Panoramas en tu zona ——— */}
        <PanoramasEnZona />

        <hr className="border-none h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

        {/* ——— En Tendencia ——— */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-1 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Esta semana
              </p>
              <h2 className="section-title">En Tendencia</h2>
              <p className="section-subtitle mt-1">Lo más popular entre los usuarios</p>
            </div>
            <Link href="/explore?q=tendencia" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-stagger">
            {enTendencia.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        </section>

        <hr className="border-none h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

        {/* ——— Recomendados ——— */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Personalizadas
              </p>
              <h2 className="section-title">Recomendadas para ti</h2>
              <p className="section-subtitle mt-1">Basado en tus preferencias y el clima</p>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-stagger">
            {destacadas.map((actividad, i) => (
              <ActivityCard key={actividad.id} actividad={actividad} indice={i} />
            ))}
          </div>
        </section>

        <hr className="border-none h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

        {/* ——— Clima + CTA ——— */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4">
          <Suspense fallback={<div className="rounded-2xl border border-ink-200 h-52 animate-pulse bg-cream-200" />}>
            <WeatherLive climaInicial={clima} />
          </Suspense>

          {/* CTA card — teal sólido con borde negro */}
          <div className="relative overflow-hidden rounded-2xl border border-ink-900 bg-teal-400 p-8 flex flex-col justify-between min-h-[220px]">
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-teal-300/50" />
            <div className="pointer-events-none absolute -right-2 top-6 h-24 w-24 rounded-full border-2 border-ink-900/10" />

            <div className="relative">
              <p className="eyebrow text-teal-700 mb-2">Tu ciudad</p>
              <h3 className="font-display text-2xl font-bold text-ink-900 leading-snug">
                Descubre actividades cerca de ti
              </h3>
              <p className="mt-2 text-sm text-teal-800">
                Activa tu ubicación para ver recomendaciones según tu zona y el clima de hoy.
              </p>
            </div>

            <Link
              href="/map"
              className="relative mt-6 inline-flex items-center gap-2 self-start rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-cream-100 transition-all duration-150 hover:shadow-offset-teal hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
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
