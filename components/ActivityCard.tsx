"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Film,
  Drama,
  Trees,
  UtensilsCrossed,
  Landmark,
  Dumbbell,
  Music,
  Mountain,
  Wine,
  Palette,
} from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatearPrecio, cn } from "@/lib/utils";
import { CrowdIndicator } from "./CrowdIndicator";

const iconosCategoria: Record<string, React.ElementType> = {
  cine:        Film,
  teatro:      Drama,
  parques:     Trees,
  gastronomia: UtensilsCrossed,
  museos:      Landmark,
  deportes:    Dumbbell,
  musica:      Music,
  "aire-libre": Mountain,
  nightlife:   Wine,
  talleres:    Palette,
};

interface ActivityCardProps {
  actividad: Activity;
  indice?: number;
}

export function ActivityCard({ actividad, indice = 0 }: ActivityCardProps) {
  const IconoCategoria = iconosCategoria[actividad.categoria] ?? Film;

  return (
    <Link
      href={`/activity/${actividad.id}`}
      className="group block overflow-hidden rounded-2xl border border-ink-900/10 bg-cream-100 transition-all duration-200 ease-out hover:border-ink-900/20 hover:-translate-y-0.5 hover:shadow-offset cursor-pointer"
      style={{ animationDelay: `${indice * 75}ms` }}
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={actividad.imagen}
          alt={actividad.nombre}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient overlay en la base */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Badges superiores */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {/* Badge categoría — glass crema */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100/90 backdrop-blur-sm border border-ink-900/10 px-3 py-1 text-xs font-medium text-ink-700">
            <IconoCategoria className="h-3 w-3" />
            {actividad.categoria.charAt(0).toUpperCase() +
              actividad.categoria.slice(1).replace("-", " ")}
          </span>

          {/* Precio */}
          <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm border border-ink-900/10 px-3 py-1 text-xs font-bold text-ink-900">
            {formatearPrecio(actividad.precio.valor, actividad.precio.moneda)}
          </span>
        </div>

        {/* Badge tendencia */}
        {actividad.enTendencia && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-400 border border-ink-900 px-3 py-1 text-xs font-semibold text-ink-900">
              <TrendingUp className="h-3 w-3" />
              Tendencia
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <h3 className="font-semibold text-ink-900 leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-teal-600">
          {actividad.nombre}
        </h3>

        {/* Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{actividad.ubicacion.direccion}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{actividad.horario.apertura} — {actividad.horario.cierre}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-ink-900/6">
          {/* Rating con estrellas */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(actividad.rating)
                      ? "fill-teal-400 text-teal-400"
                      : "fill-ink-200 text-ink-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-ink-700">
              {actividad.rating}
            </span>
            <span className="text-xs text-ink-400">
              ({actividad.totalResenas})
            </span>
          </div>

          {/* Afluencia */}
          <CrowdIndicator nivel={actividad.afluencia} compacto />
        </div>
      </div>
    </Link>
  );
}
