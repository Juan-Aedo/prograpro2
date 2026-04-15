"use client";

import { WeatherBadge } from "@/components/WeatherBadge";
import { useWeather } from "@/lib/hooks/useWeather";
import type { WeatherData } from "@/lib/types";

interface WeatherLiveProps {
  climaInicial?: WeatherData | null;
}

export function WeatherLive({ climaInicial = null }: WeatherLiveProps) {
  const { clima, loading, error } = useWeather(climaInicial);

  if (!clima && loading) {
    return <div className="rounded-2xl border border-ink-200 h-52 animate-pulse bg-cream-200" />;
  }

  if (!clima) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-cream-200 p-6 text-sm text-ink-500">
        {error ?? "No se pudo cargar el clima."}
      </div>
    );
  }

  return <WeatherBadge clima={clima} />;
}
