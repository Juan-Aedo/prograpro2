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
    a.viento !== b.viento ||
    a.ciudad !== b.ciudad
  );
}

export function useWeather(climaInicial: WeatherData | null = null): UseWeatherReturn {
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);

  const [clima, setClima] = useState<WeatherData | null>(climaInicial);
  const [loading, setLoading] = useState(climaInicial === null);
  const [error, setError] = useState<string | null>(null);
  const climaRef = useRef<WeatherData | null>(climaInicial);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchClima = useCallback(async (latActual: number, lngActual: number) => {
    // Cancelar request anterior y marcar el nuevo como el vigente
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myId = ++requestIdRef.current;

    try {
      const res = await fetch(
        `/api/weather?lat=${latActual}&lng=${lngActual}`,
        { cache: "no-store", signal: controller.signal }
      );
      if (!res.ok) throw new Error("No se pudo obtener el clima");
      const data: WeatherData = await res.json();
      // Descartar respuesta si ya no es la última solicitada
      if (myId !== requestIdRef.current) return;
      if (climaCambio(climaRef.current, data)) {
        climaRef.current = data;
        setClima(data);
      }
      setError(null);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (myId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Error de clima");
    } finally {
      if (myId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    climaRef.current = null;
    setLoading(true);
    fetchClima(lat, lng);
    const id = setInterval(() => fetchClima(lat, lng), POLL_INTERVAL_MS);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
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
