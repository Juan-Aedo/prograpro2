"use client";

import {
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog,
  Check, X, CloudDrizzle,
} from "lucide-react";
import { useWeather } from "@/lib/hooks/useWeather";
import type { Activity, WeatherDayForecast } from "@/lib/types";

const iconosClima: Record<string, React.ElementType> = {
  "clear":         Sun,
  "partly-cloudy": CloudSun,
  "cloudy":        Cloud,
  "rain":          CloudRain,
  "storm":         CloudLightning,
  "snow":          Snowflake,
  "fog":           CloudFog,
};

const DIA_A_NUM: Record<string, number> = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  "Miércoles": 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
};

const MAL_CLIMA = new Set(["rain", "storm", "snow"]);

interface Props {
  actividad: Activity;
}

function DayCard({ dia, diasDisponibles }: { dia: WeatherDayForecast; diasDisponibles: string[] }) {
  const diaSemana = new Date(dia.fecha + "T12:00:00").getDay();
  const estaAbierto = diasDisponibles.some((d) => DIA_A_NUM[d] === diaSemana);
  const lluviaOTormenta = estaAbierto && MAL_CLIMA.has(dia.icono);

  const Icono = iconosClima[dia.icono] ?? Sun;
  const diaNum = dia.fecha.split("-")[2] ?? "";

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-cream-100 px-3 py-3 min-w-[72px]">
      <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide">
        {dia.diaCorto}
      </span>
      <span className="text-[11px] text-ink-400">{diaNum}</span>
      <Icono className="h-5 w-5 text-amber-500" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-bold text-ink-900">{dia.tempMax}°</span>
        <span className="text-[10px] text-ink-400">{dia.tempMin}°</span>
      </div>
      {estaAbierto ? (
        lluviaOTormenta ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
            <CloudDrizzle className="h-2.5 w-2.5" />
            Lluvia
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-100 border border-teal-300 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
            <Check className="h-2.5 w-2.5" />
            Abierto
          </span>
        )
      ) : (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-cream-200 border border-ink-200 px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
          <X className="h-2.5 w-2.5" />
          Cerrado
        </span>
      )}
    </div>
  );
}

export function ClimaYDisponibilidad({ actividad }: Props) {
  const { clima, loading } = useWeather();
  const dias = clima?.pronosticoDiario ?? [];

  return (
    <div className="card p-5">
      <div className="mb-3">
        <p className="eyebrow mb-0.5">Próximos 5 días</p>
        <h3 className="font-display text-base font-bold text-ink-900">
          Clima &amp; Disponibilidad
        </h3>
        {clima && (
          <p className="text-xs text-ink-400 mt-0.5">{clima.ciudad}</p>
        )}
      </div>

      {loading || dias.length === 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[72px] h-[120px] rounded-xl border border-ink-200 bg-cream-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dias.map((dia) => (
            <DayCard
              key={dia.fecha}
              dia={dia}
              diasDisponibles={actividad.horario.diasDisponibles}
            />
          ))}
        </div>
      )}

      <p className="mt-3 text-[11px] text-ink-400">
        Días abiertos: {actividad.horario.diasDisponibles.join(", ")}
      </p>
    </div>
  );
}
