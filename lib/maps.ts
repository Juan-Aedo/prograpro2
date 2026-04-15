// Utilidades geográficas: distancias y URLs a Google Maps.

const aRadianes = (grados: number): number => (grados * Math.PI) / 180;

export function calcularDistanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = aRadianes(lat2 - lat1);
  const dLng = aRadianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatearDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function generarUrlMaps(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function generarUrlMapsDestino(lat: number, lng: number, nombre: string): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${encodeURIComponent(nombre)}` +
    `&destination_place_id=${lat},${lng}`
  );
}
