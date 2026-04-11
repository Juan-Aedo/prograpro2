"use client";

import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Droplets,
  Wind,
} from "lucide-react";
import type { WeatherData } from "@/lib/types";

const iconosClima: Record<string, React.ElementType> = {
  "clear": Sun,
  "partly-cloudy": CloudSun,
  "cloudy": Cloud,
  "rain": CloudRain,
  "storm": CloudLightning,
  "snow": Snowflake,
  "fog": CloudFog,
};

interface WeatherBadgeProps {
  clima: WeatherData;
  compacto?: boolean;
}

export function WeatherBadge({ clima, compacto = false }: WeatherBadgeProps) {
  const IconoClima = iconosClima[clima.icono] ?? Sun;

  if (compacto) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm border border-surface-100">
        <IconoClima className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold text-surface-900">
          {clima.temperatura}°
        </span>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">
            Clima actual
          </p>
          <p className="text-sm font-medium text-surface-600">
            {clima.ciudad}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <IconoClima className="h-7 w-7 text-amber-500" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-surface-900 tracking-tight">
          {clima.temperatura}°
        </span>
        <span className="text-lg text-surface-400">C</span>
      </div>

      <p className="mt-1 text-sm text-surface-500 capitalize">
        {clima.descripcion}
      </p>

      <div className="mt-4 flex items-center gap-4 border-t border-surface-100 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Droplets className="h-3.5 w-3.5 text-blue-400" />
          <span>{clima.humedad}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Wind className="h-3.5 w-3.5 text-surface-400" />
          <span>{clima.viento} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          <span>ST {clima.sensacionTermica}°</span>
        </div>
      </div>
    </div>
  );
}
