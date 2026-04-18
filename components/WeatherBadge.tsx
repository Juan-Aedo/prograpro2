"use client";

import { Sun, Droplets, Wind } from "lucide-react";
import type { WeatherData } from "@/lib/types";
import { iconoParaClima } from "@/lib/iconMap";

interface WeatherBadgeProps {
  clima: WeatherData;
  compacto?: boolean;
}

export function WeatherBadge({ clima, compacto = false }: WeatherBadgeProps) {
  const IconoClima = iconoParaClima(clima.icono);

  if (compacto) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-ink-900/12 bg-cream-100/90 backdrop-blur-sm px-4 py-2">
        <IconoClima className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold text-ink-900">{clima.temperatura}°</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-cream-200 p-6 transition-all duration-200 hover:border-ink-900/20 hover:shadow-offset-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow mb-1">Clima actual</p>
          <p className="text-sm font-medium text-ink-700">{clima.ciudad}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-ink-900/10 bg-cream-100">
          <IconoClima className="h-6 w-6 text-amber-500" />
        </div>
      </div>

      {/* Temperatura — display serif */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-6xl font-bold text-ink-900 tracking-tight">
          {clima.temperatura}°
        </span>
        <span className="text-xl text-ink-400 font-medium">C</span>
      </div>

      <p className="mt-1 text-sm text-ink-500 capitalize">{clima.descripcion}</p>

      {/* Stats */}
      <div className="mt-5 flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-cream-100 px-3 py-1.5 text-xs text-ink-600">
          <Droplets className="h-3.5 w-3.5 text-teal-500" />
          {clima.humedad}% humedad
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-cream-100 px-3 py-1.5 text-xs text-ink-600">
          <Wind className="h-3.5 w-3.5 text-ink-400" />
          {clima.viento} km/h
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-cream-100 px-3 py-1.5 text-xs text-ink-600">
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          ST {clima.sensacionTermica}°
        </div>
        {typeof clima.tempMin === "number" && typeof clima.tempMax === "number" && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-cream-100 px-3 py-1.5 text-xs text-ink-600">
            {clima.tempMin}° / {clima.tempMax}°
          </div>
        )}
      </div>

      {/* Pronóstico del día */}
      {clima.pronostico && clima.pronostico.length > 0 && (
        <div className="mt-5 border-t border-ink-900/10 pt-4">
          <p className="eyebrow mb-3">Pronóstico de hoy</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {clima.pronostico.map((item, i) => {
              const Icono = iconoParaClima(item.icono);
              return (
                <div
                  key={`${item.hora}-${i}`}
                  className="flex min-w-[72px] flex-col items-center gap-1 rounded-xl border border-ink-200 bg-cream-100 px-3 py-2"
                >
                  <span className="text-[11px] font-medium text-ink-500">{item.hora}</span>
                  <Icono className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-bold text-ink-900">{item.temperatura}°</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
