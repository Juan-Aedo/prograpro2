"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

async function nombreCiudadDesdeCoords(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&accept-language=es`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return "Tu ubicación";
    const data = await res.json();
    return (
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.suburb ??
      data.address?.county ??
      "Tu ubicación"
    );
  } catch {
    return "Tu ubicación";
  }
}

async function ubicacionPorIP(): Promise<{ lat: number; lng: number; ciudad: string } | null> {
  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success === false) return null;
    const lat = typeof data.latitude === "number" ? data.latitude : null;
    const lng = typeof data.longitude === "number" ? data.longitude : null;
    if (lat == null || lng == null) return null;
    const ciudad =
      data.city ?? data.region ?? data.country ?? "Tu ubicación";
    return { lat, lng, ciudad };
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const modo = useLocationStore((s) => s.modo);
  const setGps = useLocationStore((s) => s.setGps);

  useEffect(() => {
    if (modo === "manual") return;
    if (typeof window === "undefined") return;

    let cancelado = false;

    const aplicarPorIP = async () => {
      const fb = await ubicacionPorIP();
      if (cancelado || !fb) return;
      setGps(fb.lat, fb.lng, fb.ciudad);
    };

    if (!("geolocation" in navigator)) {
      aplicarPorIP();
      return () => { cancelado = true; };
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelado) return;
        const { latitude, longitude } = pos.coords;
        const ciudad = await nombreCiudadDesdeCoords(latitude, longitude);
        if (cancelado) return;
        setGps(latitude, longitude, ciudad);
      },
      () => {
        aplicarPorIP();
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );

    return () => { cancelado = true; };
  }, [modo, setGps]);

  return <>{children}</>;
}
