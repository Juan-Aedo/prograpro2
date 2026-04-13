"use client";

import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { generarUrlMaps } from "@/lib/maps";

interface MapWidgetProps {
  lat: number;
  lng: number;
  direccion: string;
  nombre?: string;
  className?: string;
}

export function MapWidget({ lat, lng, direccion, nombre, className = "" }: MapWidgetProps) {
  const urlMaps = generarUrlMaps(lat, lng);

  return (
    <div className={`overflow-hidden rounded-2xl border border-ink-900/10 bg-cream-100 transition-all duration-200 hover:border-ink-900/20 hover:shadow-offset-sm ${className}`}>
      {/* Placeholder mapa */}
      <div className="relative aspect-video bg-gradient-to-br from-cream-200 via-teal-100/30 to-cream-300">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400 border border-ink-900/15 transition-all duration-150 hover:shadow-offset-sm">
            <MapPin className="h-7 w-7 text-ink-900" />
          </div>
          {nombre && (
            <p className="text-sm font-semibold text-ink-800 text-center px-4">{nombre}</p>
          )}
          <p className="text-xs text-ink-400">Mapa interactivo — requiere API Key</p>
        </div>

        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A1A1A" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-ink-400 flex-shrink-0" />
          <p className="text-sm text-ink-600">{direccion}</p>
        </div>
        <div className="flex gap-2">
          <a href={urlMaps} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-xs py-2.5 px-4">
            <Navigation className="h-3.5 w-3.5" />
            Cómo llegar
          </a>
          <a href={urlMaps} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2.5 px-3">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
