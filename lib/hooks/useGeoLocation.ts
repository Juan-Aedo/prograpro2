"use client";

import { useState } from "react";

export interface GeoLocationResult {
  lat: number;
  lng: number;
  ciudad: string;
}

export interface UseGeoLocationReturn {
  loading: boolean;
  error: string;
  detectar: () => Promise<GeoLocationResult | null>;
  clearError: () => void;
}

async function geocodificarCiudad(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "es" } }
    );
    const data = await res.json();
    const addr = data.address;
    return addr?.city ?? addr?.town ?? addr?.village ?? addr?.county ?? "";
  } catch {
    return "";
  }
}

export function useGeoLocation(): UseGeoLocationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detectar = (): Promise<GeoLocationResult | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Tu navegador no soporta geolocalización.");
        resolve(null);
        return;
      }
      setLoading(true);
      setError("");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const ciudad = await geocodificarCiudad(latitude, longitude);
          setLoading(false);
          resolve({ lat: latitude, lng: longitude, ciudad });
        },
        () => {
          setError("No se pudo obtener tu ubicación. Escríbela manualmente.");
          setLoading(false);
          resolve(null);
        }
      );
    });
  };

  return { loading, error, detectar, clearError: () => setError("") };
}

export async function geocodificarTexto(texto: string): Promise<GeoLocationResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(texto)}`,
      { headers: { "Accept-Language": "es" } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        ciudad: texto,
      };
    }
  } catch {
    // fall through
  }
  return null;
}
