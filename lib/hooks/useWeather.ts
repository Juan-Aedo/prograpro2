"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WeatherData } from "@/lib/types";

const SANTIAGO_LAT = -33.4489;
const SANTIAGO_LNG = -70.6693;
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
  const [clima, setClima] = useState<WeatherData | null>(climaInicial);
  const [loading, setLoading] = useState(climaInicial === null);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState(SANTIAGO_LAT);
  const [lng, setLng] = useState(SANTIAGO_LNG);
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
    let currentLat = SANTIAGO_LAT;
    let currentLng = SANTIAGO_LNG;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const iniciarPolling = () => {
      fetchClima(currentLat, currentLng);
      intervalId = setInterval(() => {
        fetchClima(currentLat, currentLng);
      }, POLL_INTERVAL_MS);
    };

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentLat = pos.coords.latitude;
          currentLng = pos.coords.longitude;
          setLat(currentLat);
          setLng(currentLng);
          iniciarPolling();
        },
        () => {
          iniciarPolling();
        },
        { timeout: 5000 }
      );
    } else {
      iniciarPolling();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchClima]);

  return {
    clima,
    loading,
    error,
    lat,
    lng,
    refetch: () => fetchClima(lat, lng),
  };
}
