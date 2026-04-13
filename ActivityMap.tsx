"use client";

import { useEffect, useRef } from "react";
import type { Activity } from "@/lib/types";

// ─────────────────────────────────────────────
//  COMPONENTE DE MAPA COMPLETO
//  – Leaflet + OpenStreetMap (sin API key)
//  – Scroll/wheel en desktop
//  – Drag/touch en mobile y tablet
//  – Marcadores con colores según disponibilidad
//  – Popup con info de la actividad
// ─────────────────────────────────────────────

interface ActivityMapProps {
  actividades: Activity[];
  selected: Activity | null;
  onSelect: (actividad: Activity | null) => void;
  center?: [number, number];
  zoom?: number;
}

const SANTIAGO_CENTER: [number, number] = [-33.4569, -70.6483];

function colorMarker(actividad: Activity): string {
  if (!actividad.cuposDisponibles) return "#ef4444"; // rojo — agotado
  if (actividad.recScore !== undefined) {
    if ((actividad as any).recScore >= 80) return "#16a34a"; // verde — alta rec
    if ((actividad as any).recScore >= 60) return "#2563eb"; // azul — media rec
  }
  return "#6b7280"; // gris — sin score especial
}

function crearIcono(color: string, isSelected: boolean, L: any) {
  const size = isSelected ? 20 : 14;
  const border = isSelected ? "3px solid #fff" : "2px solid #fff";
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${border};
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,.35);
      transition: all .2s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

export default function ActivityMap({
  actividades,
  selected,
  onSelect,
  center = SANTIAGO_CENTER,
  zoom = 13,
}: ActivityMapProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const LRef = useRef<any>(null);

  // Inicializar el mapa
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const init = async () => {
      // Inyectar CSS de Leaflet
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const L = (await import("leaflet" as any)).default ?? (await import("leaflet" as any));
      LRef.current = L;

      // Fix íconos en bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center,
        zoom,
        // Navegación con scroll/rueda del mouse en desktop
        scrollWheelZoom: true,
        // Arrastre con el dedo en mobile/tablet
        dragging: true,
        touchZoom: true,
        tap: true,
        tapTolerance: 15,
        doubleClickZoom: true,
        zoomControl: true,
        // Mejoras para mobile
        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: 1500,
      });

      // Tiles de OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      mapRef.current = map;

      // Leyenda
      const legend = L.control({ position: "bottomright" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div");
        div.style.cssText =
          "background:white;padding:10px;border-radius:10px;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.15);line-height:1.8";
        div.innerHTML = `
          <strong style="display:block;margin-bottom:4px">Leyenda</strong>
          <span>🟢</span> Alta recomendación<br/>
          <span>🔵</span> Media recomendación<br/>
          <span>⚫</span> Sin puntaje<br/>
          <span>🔴</span> Agotado
        `;
        return div;
      };
      legend.addTo(map);
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar marcadores cuando cambian las actividades
  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapRef.current;

    // Eliminar marcadores existentes
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    actividades.forEach((act) => {
      const color = colorMarker(act);
      const isSel = selected?.id === act.id;
      const icono = crearIcono(color, isSel, L);

      const marker = L.marker([act.ubicacion.lat, act.ubicacion.lng], {
        icon: icono,
        title: act.nombre,
        riseOnHover: true,
      }).addTo(map);

      // Popup con info básica
      const popupContent = `
        <div style="min-width:180px;font-family:system-ui,sans-serif">
          <p style="font-weight:600;font-size:13px;margin:0 0 4px">${act.nombre}</p>
          <p style="font-size:11px;color:#666;margin:0 0 6px">${act.ubicacion.direccion}</p>
          <div style="display:flex;gap:8px;align-items:center;font-size:12px">
            <span style="font-weight:600;color:#16a34a">
              ${act.precio.valor === 0 ? "Gratis" : `$${act.precio.valor.toLocaleString("es-CL")}`}
            </span>
            <span>⭐ ${act.rating}</span>
            ${!act.cuposDisponibles ? '<span style="color:#ef4444;font-weight:500">⛔ Agotado</span>' : ""}
          </div>
          <a
            href="/activity/${act.id}"
            style="display:block;margin-top:8px;padding:5px;background:#16a34a;color:#fff;border-radius:6px;text-align:center;font-size:11px;font-weight:500;text-decoration:none"
          >Ver detalles</a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 220,
        closeButton: true,
      });

      marker.on("click", () => {
        onSelect(act);
        marker.openPopup();
      });

      markersRef.current.set(act.id, marker);
    });
  }, [actividades, selected, onSelect]);

  // Centrar en actividad seleccionada
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    mapRef.current.flyTo(
      [selected.ubicacion.lat, selected.ubicacion.lng],
      16,
      { duration: 0.8 }
    );
    const marker = markersRef.current.get(selected.id);
    if (marker) marker.openPopup();
  }, [selected]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 400 }}
    />
  );
}
