"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const modo = useLocationStore((s) => s.modo);
  const setGps = useLocationStore((s) => s.setGps);

  useEffect(() => {
    if (modo === "manual") return;
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let ciudad = "Tu ubicación";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&accept-language=es`,
            { headers: { "Accept-Language": "es" } }
          );
          if (res.ok) {
            const data = await res.json();
            ciudad =
              data.address?.city ??
              data.address?.town ??
              data.address?.village ??
              data.address?.suburb ??
              data.address?.county ??
              "Tu ubicación";
          }
        } catch {
          // nombre opcional, coordenadas son suficientes
        }
        setGps(latitude, longitude, ciudad);
      },
      () => {
        // Permiso denegado o error: mantiene default (Santiago Centro)
      },
      { timeout: 7000, maximumAge: 300_000 }
    );
  }, [modo, setGps]);

  return <>{children}</>;
}
