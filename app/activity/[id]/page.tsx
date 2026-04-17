import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Star, MapPin, Clock,
  Calendar, Tag, TrendingUp, Share2, Heart,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { serializeActivity } from "@/lib/serializers";
import { formatearPrecio, cn } from "@/lib/utils";
import dynamicImport from "next/dynamic";
import { CrowdIndicator } from "@/components/CrowdIndicator";
import { MapWidget } from "@/components/MapWidget";
import { BookingForm } from "@/components/BookingForm";

const ClimaYDisponibilidad = dynamicImport(
  () => import("@/components/ClimaYDisponibilidad").then((m) => m.ClimaYDisponibilidad),
  { ssr: false }
);

interface Props {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({ params }: Props) {
  const row = await prisma.activity.findUnique({ where: { id: params.id } });
  if (!row) notFound();
  const actividad = serializeActivity(row);

  return (
    <div className="pb-24 md:pb-8">
      {/* Imagen hero */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <Image
          src={actividad.imagen}
          alt={actividad.nombre}
          fill className="object-cover" priority sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Navegación */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100/90 backdrop-blur-sm border border-ink-900/10 text-ink-700 transition-all duration-150 hover:shadow-offset-sm cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100/90 backdrop-blur-sm border border-ink-900/10 text-ink-700 transition-all duration-150 hover:shadow-offset-sm cursor-pointer">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100/90 backdrop-blur-sm border border-ink-900/10 text-ink-700 transition-all duration-150 hover:shadow-offset-sm hover:text-red-500 cursor-pointer">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Info sobre imagen */}
        <div className="absolute bottom-4 left-4 right-4">
          {actividad.enTendencia && (
            <span className="badge bg-teal-400 border border-ink-900 text-ink-900 mb-2 inline-flex">
              <TrendingUp className="h-3 w-3" />
              En Tendencia
            </span>
          )}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {actividad.nombre}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info rápida */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < Math.floor(actividad.rating) ? "fill-teal-400 text-teal-400" : "fill-ink-200 text-ink-200")} />
                  ))}
                </div>
                <span className="text-lg font-bold text-ink-900">{actividad.rating}</span>
                <span className="text-sm text-ink-400">({actividad.totalResenas} reseñas)</span>
              </div>
              <CrowdIndicator nivel={actividad.afluencia} />
              <span className="font-display text-2xl font-bold text-teal-600">
                {formatearPrecio(actividad.precio.valor, actividad.precio.moneda)}
                {actividad.precio.esPorPersona && actividad.precio.valor > 0 && (
                  <span className="text-sm font-normal text-ink-400"> /persona</span>
                )}
              </span>
            </div>

            {/* Descripción */}
            <div className="card p-6">
              <h2 className="section-title mb-3">Descripción</h2>
              <p className="text-sm text-ink-600 leading-relaxed">{actividad.descripcion}</p>
            </div>

            {/* Detalles */}
            <div className="card p-6 space-y-4">
              <h2 className="section-title">Detalles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icono: MapPin,    label: "Ubicación",         valor: actividad.ubicacion.direccion },
                  { icono: Clock,     label: "Horario",            valor: `${actividad.horario.apertura} — ${actividad.horario.cierre}` },
                  { icono: Calendar,  label: "Días disponibles",   valor: actividad.horario.diasDisponibles.join(", ") },
                ].map(({ icono: Icono, label, valor }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 border border-teal-200 flex-shrink-0">
                      <Icono className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink-400">{label}</p>
                      <p className="text-sm text-ink-700">{valor}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 border border-teal-200 flex-shrink-0">
                    <Tag className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink-400">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {actividad.tags.map((tag) => (
                        <span key={tag} className="badge bg-cream-200 text-ink-600 border border-ink-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <BookingForm actividad={actividad} />
            <ClimaYDisponibilidad actividad={actividad} />
            <MapWidget
              lat={actividad.ubicacion.lat}
              lng={actividad.ubicacion.lng}
              direccion={actividad.ubicacion.direccion}
              nombre={actividad.nombre}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
