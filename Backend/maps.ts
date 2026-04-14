import type { Activity, MapInfo } from "../types";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

// ── Genera URL de Google Maps para navegación ──
export function generarUrlMaps(lat: number, lng: number, nombre?: string): string {
  const destino = nombre
    ? encodeURIComponent(nombre)
    : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destino}&destination_place_id=${lat},${lng}`;
}

// ── Genera URL de embed para iframe (requiere API key) ──
export function generarUrlEmbed(lat: number, lng: number, nombre?: string): string {
  if (!GOOGLE_MAPS_API_KEY) {
    // Fallback sin key: mapa estático de OpenStreetMap
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;
  }
  const q = nombre ? encodeURIComponent(nombre) : `${lat},${lng}`;
  return (
    `https://www.google.com/maps/embed/v1/place` +
    `?key=${GOOGLE_MAPS_API_KEY}&q=${q}&center=${lat},${lng}&zoom=15`
  );
}

// ── Distancia Haversine (fallback sin API key) ──
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatearDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function estimarDuracion(km: number): { texto: string; segundos: number } {
  // Velocidad media en auto urbano: ~25 km/h
  const minutos = Math.round((km / 25) * 60);
  if (minutos < 60) return { texto: `${minutos} min`, segundos: minutos * 60 };
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return { texto: `${h} h ${m} min`, segundos: minutos * 60 };
}

// ── Obtiene info de distancia desde Google Distance Matrix API ──
// Si no hay API key, usa Haversine como fallback
async function obtenerDistanciaGoogle(
  origenLat: number, origenLng: number,
  destinoLat: number, destinoLng: number
): Promise<{ distanciaTexto: string; distanciaMetros: number; duracionTexto: string; duracionSegundos: number }> {
  if (!GOOGLE_MAPS_API_KEY) throw new Error("No API key");

  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${origenLat},${origenLng}` +
    `&destinations=${destinoLat},${destinoLng}` +
    `&mode=driving&language=es&units=metric` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Maps API error: ${res.status}`);

  const data = await res.json();
  const element = data?.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") throw new Error("No route found");

  return {
    distanciaTexto: element.distance.text,
    distanciaMetros: element.distance.value,
    duracionTexto: element.duration.text,
    duracionSegundos: element.duration.value,
  };
}

// ── Enriquece una actividad con info de Maps ──
export async function enriquecerConMaps(
  actividad: Activity,
  usuarioLat: number,
  usuarioLng: number
): Promise<MapInfo> {
  let distanciaTexto: string;
  let distanciaMetros: number;
  let duracionTexto: string;
  let duracionSegundos: number;

  try {
    const resultado = await obtenerDistanciaGoogle(
      usuarioLat, usuarioLng,
      actividad.ubicacion.lat, actividad.ubicacion.lng
    );
    distanciaTexto = resultado.distanciaTexto;
    distanciaMetros = resultado.distanciaMetros;
    duracionTexto = resultado.duracionTexto;
    duracionSegundos = resultado.duracionSegundos;
  } catch {
    // Fallback Haversine
    const km = haversineKm(
      usuarioLat, usuarioLng,
      actividad.ubicacion.lat, actividad.ubicacion.lng
    );
    distanciaTexto = formatearDistancia(km);
    distanciaMetros = Math.round(km * 1000);
    const dur = estimarDuracion(km);
    duracionTexto = dur.texto;
    duracionSegundos = dur.segundos;
  }

  return {
    actividadId: actividad.id,
    distanciaTexto,
    distanciaMetros,
    duracionTexto,
    duracionSegundos,
    urlMaps: generarUrlMaps(actividad.ubicacion.lat, actividad.ubicacion.lng, actividad.nombre),
    urlEmbed: generarUrlEmbed(actividad.ubicacion.lat, actividad.ubicacion.lng, actividad.nombre),
  };
}

// ── Enriquece un lote de actividades en paralelo ──
export async function enriquecerLote(
  actividades: Activity[],
  usuarioLat: number,
  usuarioLng: number
): Promise<Map<string, MapInfo>> {
  const resultados = await Promise.allSettled(
    actividades.map((a) => enriquecerConMaps(a, usuarioLat, usuarioLng))
  );

  const mapa = new Map<string, MapInfo>();
  resultados.forEach((r, i) => {
    if (r.status === "fulfilled") {
      mapa.set(actividades[i].id, r.value);
    }
  });
  return mapa;
}

// ── Filtra actividades por radio desde el usuario ──
export function filtrarPorRadio(
  actividades: Activity[],
  usuarioLat: number,
  usuarioLng: number,
  radioMetros: number
): Activity[] {
  return actividades.filter((a) => {
    const km = haversineKm(usuarioLat, usuarioLng, a.ubicacion.lat, a.ubicacion.lng);
    return km * 1000 <= radioMetros;
  });
}
