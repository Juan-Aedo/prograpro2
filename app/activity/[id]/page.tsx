import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Calendar,
  Tag,
  TrendingUp,
  Share2,
  Heart,
  Ticket,
} from "lucide-react";
import { actividades } from "@/lib/mock-data";
import { formatearPrecio } from "@/lib/utils";
import { CrowdIndicator } from "@/components/CrowdIndicator";
import { MapWidget } from "@/components/MapWidget";
import { BookingForm } from "@/components/BookingForm";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return actividades.map((a) => ({ id: a.id }));
}

export default function ActivityDetailPage({ params }: Props) {
  const actividad = actividades.find((a) => a.id === params.id);

  if (!actividad) {
    notFound();
  }

  return (
    <div className="pb-24 md:pb-8">
      {/* Imagen hero */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <Image
          src={actividad.imagen}
          alt={actividad.nombre}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Navegación sobre imagen */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-surface-700 transition-all duration-200 hover:bg-white cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-surface-700 transition-all duration-200 hover:bg-white cursor-pointer">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-surface-700 transition-all duration-200 hover:bg-white hover:text-red-500 cursor-pointer">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Info sobre imagen */}
        <div className="absolute bottom-4 left-4 right-4">
          {actividad.enTendencia && (
            <span className="badge bg-coral-500 text-white mb-2 inline-flex">
              <TrendingUp className="h-3 w-3" />
              En Tendencia
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {actividad.nombre}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info rápida */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-surface-900">
                  {actividad.rating}
                </span>
                <span className="text-sm text-surface-400">
                  ({actividad.totalResenas} reseñas)
                </span>
              </div>
              <CrowdIndicator nivel={actividad.afluencia} />
              <span className="text-2xl font-bold text-brand-600">
                {formatearPrecio(
                  actividad.precio.valor,
                  actividad.precio.moneda
                )}
                {actividad.precio.esPorPersona && actividad.precio.valor > 0 && (
                  <span className="text-sm font-normal text-surface-400">
                    {" "}
                    /persona
                  </span>
                )}
              </span>
            </div>

            {/* Descripción */}
            <div className="card p-5">
              <h2 className="section-title mb-3">Descripción</h2>
              <p className="text-sm text-surface-600 leading-relaxed">
                {actividad.descripcion}
              </p>
            </div>

            {/* Detalles */}
            <div className="card p-5 space-y-4">
              <h2 className="section-title">Detalles</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-400">
                      Ubicación
                    </p>
                    <p className="text-sm text-surface-700">
                      {actividad.ubicacion.direccion}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 flex-shrink-0">
                    <Clock className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-400">
                      Horario
                    </p>
                    <p className="text-sm text-surface-700">
                      {actividad.horario.apertura} — {actividad.horario.cierre}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-400">
                      Días disponibles
                    </p>
                    <p className="text-sm text-surface-700">
                      {actividad.horario.diasDisponibles.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 flex-shrink-0">
                    <Tag className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-400">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {actividad.tags.map((tag) => (
                        <span
                          key={tag}
                          className="badge bg-surface-100 text-surface-600"
                        >
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
            {/* Formulario de reserva */}
            <BookingForm actividad={actividad} />

            {/* Mapa */}
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
