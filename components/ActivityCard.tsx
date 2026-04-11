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

// Mapa de componentes de ícono por categoría
const iconosCategoria: Record<string, React.ElementType> = {
  cine: Film,
  teatro: Drama,
  parques: Trees,
  gastronomia: UtensilsCrossed,
  museos: Landmark,
  deportes: Dumbbell,
  musica: Music,
  "aire-libre": Mountain,
  nightlife: Wine,
  talleres: Palette,
};

const coloresCategoria: Record<string, string> = {
  cine: "bg-purple-100 text-purple-700",
  teatro: "bg-rose-100 text-rose-700",
  parques: "bg-emerald-100 text-emerald-700",
  gastronomia: "bg-amber-100 text-amber-700",
  museos: "bg-blue-100 text-blue-700",
  deportes: "bg-orange-100 text-orange-700",
  musica: "bg-indigo-100 text-indigo-700",
  "aire-libre": "bg-teal-100 text-teal-700",
  nightlife: "bg-fuchsia-100 text-fuchsia-700",
  talleres: "bg-cyan-100 text-cyan-700",
};

interface ActivityCardProps {
  actividad: Activity;
  indice?: number;
}

export function ActivityCard({ actividad, indice = 0 }: ActivityCardProps) {
  const IconoCategoria = iconosCategoria[actividad.categoria] ?? Film;
  const colorCategoria = coloresCategoria[actividad.categoria] ?? "bg-surface-100 text-surface-700";

  return (
    <Link
      href={`/activity/${actividad.id}`}
      className="card group block overflow-hidden cursor-pointer"
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

        {/* Overlay superior */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {/* Badge categoría */}
          <span className={cn("badge backdrop-blur-sm", colorCategoria)}>
            <IconoCategoria className="h-3 w-3" />
            {actividad.categoria.charAt(0).toUpperCase() +
              actividad.categoria.slice(1).replace("-", " ")}
          </span>

          {/* Precio */}
          <span className="badge bg-white/90 text-surface-900 backdrop-blur-sm font-semibold">
            {formatearPrecio(actividad.precio.valor, actividad.precio.moneda)}
          </span>
        </div>

        {/* Badge tendencia */}
        {actividad.enTendencia && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-coral-500 text-white">
              <TrendingUp className="h-3 w-3" />
              Tendencia
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <h3 className="font-semibold text-surface-900 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors duration-200">
          {actividad.nombre}
        </h3>

        {/* Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{actividad.ubicacion.direccion}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {actividad.horario.apertura} — {actividad.horario.cierre}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-100">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-surface-900">
                {actividad.rating}
              </span>
            </div>
            <span className="text-xs text-surface-400">
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
