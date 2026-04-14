"use client";

import { useState, useEffect, useCallback } from "react";
import type { WeatherData } from "@/lib/types";

// Coordenadas por defecto: Santiago Centro
const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;

interface UseWeatherReturn {
  clima: WeatherData | null;
  loading: boolean;
  error: string | null;
  lat: number;
  lng: number;
  refetch: () => void;
}

export function useWeather(): UseWeatherReturn {
  const [clima, setClima] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);

  const fetchClima = useCallback(
    async (latActual = lat, lngActual = lng) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/weather?lat=${latActual}&lng=${lngActual}`);
        if (!res.ok) throw new Error("No se pudo obtener el clima");
        const data: WeatherData = await res.json();
        setClima(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error de clima");
      } finally {
        setLoading(false);
      }
    },
    [lat, lng]
  );

  useEffect(() => {
    // Intentar geolocalización del navegador
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLat(latitude);
          setLng(longitude);
          fetchClima(latitude, longitude);
        },
        () => {
          // Fallback a Santiago si el usuario niega el permiso
          fetchClima(DEFAULT_LAT, DEFAULT_LNG);
        },
        { timeout: 5000 }
      );
    } else {
      fetchClima();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { clima, loading, error, lat, lng, refetch: () => fetchClima(lat, lng) };
}
