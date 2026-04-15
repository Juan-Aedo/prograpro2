"use client";

import { MapPin, X } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";

export function LocationBanner() {
  const modo = useLocationStore((s) => s.modo);
  const ciudad = useLocationStore((s) => s.ciudad);
  const clearManual = useLocationStore((s) => s.clearManual);

  if (modo !== "manual") return null;

  return (
    <div className="sticky top-16 z-40 border-b border-amber-300/60 bg-amber-100/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-amber-900 sm:text-sm">
          <MapPin className="h-4 w-4 text-amber-600" />
          <span className="font-medium">Modo ubicación manual:</span>
          <span className="truncate">{ciudad}</span>
        </div>
        <button
          onClick={clearManual}
          className="flex items-center gap-1 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200 cursor-pointer"
        >
          <X className="h-3 w-3" />
          Usar mi ubicación real
        </button>
      </div>
    </div>
  );
}
