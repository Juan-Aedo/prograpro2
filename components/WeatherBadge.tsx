"use client";

import {
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog,
  Droplets, Wind,
} from "lucide-react";
import type { WeatherData } from "@/lib/types";

const iconosClima: Record<string, React.ElementType> = {
  "clear":         Sun,
  "partly-cloudy": CloudSun,
  "cloudy":        Cloud,
  "rain":          CloudRain,
  "storm":         CloudLightning,
  "snow":          Snowflake,
  "fog":           CloudFog,
};

interface WeatherBadgeProps {
  clima: WeatherData;
  compacto?: boolean;
}

export function WeatherBadge({ clima, compacto = false }: WeatherBadgeProps) {
  const IconoClima = iconosClima[clima.icono] ?? Sun;

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
      </div>
    </div>
  );
}
