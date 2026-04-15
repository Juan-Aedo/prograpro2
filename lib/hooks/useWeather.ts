"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WeatherData } from "@/lib/types";
import { useLocationStore } from "@/store/locationStore";

const POLL_INTERVAL_MS = 60_000;

interface UseWeatherReturn {
  clima: WeatherData | null;
  loading: boolean;
  error: string | null;
  lat: number;
  lng: number;
  refetch: () => void;
}

function climaCambio(a: WeatherData | null, b: WeatherData): boolean {
  if (!a) return true;
  return (
    a.temperatura !== b.temperatura ||
    a.descripcion !== b.descripcion ||
    a.icono !== b.icono ||
    a.humedad !== b.humedad ||
    a.viento !== b.viento
  );
}

export function useWeather(climaInicial: WeatherData | null = null): UseWeatherReturn {
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);

  const [clima, setClima] = useState<WeatherData | null>(climaInicial);
  const [loading, setLoading] = useState(climaInicial === null);
  const [error, setError] = useState<string | null>(null);
  const climaRef = useRef<WeatherData | null>(climaInicial);

  const fetchClima = useCallback(async (latActual: number, lngActual: number) => {
    try {
      const res = await fetch(
        `/api/weather?lat=${latActual}&lng=${lngActual}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("No se pudo obtener el clima");
      const data: WeatherData = await res.json();
      if (climaCambio(climaRef.current, data)) {
        climaRef.current = data;
        setClima(data);
      }
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error de clima");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    climaRef.current = null;
    setLoading(true);
    fetchClima(lat, lng);
    const id = setInterval(() => fetchClima(lat, lng), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [lat, lng, fetchClima]);

  return {
    clima,
    loading,
    error,
    lat,
    lng,
    refetch: () => fetchClima(lat, lng),
  };
}
