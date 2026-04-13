"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, Navigation, Loader2 } from "lucide-react";
import { generarUrlMaps } from "@/lib/maps";

interface MapWidgetProps {
  lat: number;
  lng: number;
  direccion: string;
  nombre?: string;
  className?: string;
  /** Si se provee, usa Google Maps Embed (iframe). Si no, usa Leaflet OSM. */
  googleApiKey?: string;
}

// ── Leaflet Map (sin API key requerida) ────────
function LeafletMap({
  lat,
  lng,
  nombre,
}: {
  lat: number;
  lng: number;
  nombre?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      // Hoja de estilos
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Script
      const L = await import("leaflet" as any).catch(() => null);
      if (!L || !divRef.current) return;

      // Fix ícono por defecto de Leaflet en bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(divRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,   // ← scroll en desktop
        dragging: true,           // ← arrastre en mobile/tablet
        touchZoom: true,
        doubleClickZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      if (nombre) {
        marker.bindPopup(`<strong>${nombre}</strong>`).openPopup();
      }

      mapRef.current = map;
      setLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, nombre]);

  return (
    <div className="relative aspect-video">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-100 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      )}
      <div ref={divRef} className="w-full h-full" style={{ minHeight: 200 }} />
    </div>
  );
}

// ── Google Maps Embed (con API key) ────────────
function GoogleMapsEmbed({
  lat,
  lng,
  apiKey,
}: {
  lat: number;
  lng: number;
  apiKey: string;
}) {
  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
  return (
    <div className="aspect-video">
      <iframe
        src={src}
        className="w-full h-full"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de ubicación"
      />
    </div>
  );
}

// ── Widget principal ───────────────────────────
export function MapWidget({
  lat,
  lng,
  direccion,
  nombre,
  className = "",
  googleApiKey,
}: MapWidgetProps) {
  const urlMaps = generarUrlMaps(lat, lng, nombre);

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Mapa */}
      {googleApiKey ? (
        <GoogleMapsEmbed lat={lat} lng={lng} apiKey={googleApiKey} />
      ) : (
        <LeafletMap lat={lat} lng={lng} nombre={nombre} />
      )}

      {/* Info de ubicación */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-surface-400 flex-shrink-0" />
          <p className="text-sm text-surface-600">{direccion}</p>
        </div>

        <div className="flex gap-2">
          <a
            href={urlMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-xs"
          >
            <Navigation className="h-3.5 w-3.5" />
            Cómo llegar
          </a>
          <a
            href={urlMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
