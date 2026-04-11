// Utilidades para Google Maps (usa mock mientras no haya API key)

export interface Coordenadas {
  lat: number;
  lng: number;
}

// Calcula distancia entre dos puntos (fórmula de Haversine)
export function calcularDistancia(
  punto1: Coordenadas,
  punto2: Coordenadas
): number {
  const R = 6371;
  const dLat = aRadianes(punto2.lat - punto1.lat);
  const dLng = aRadianes(punto2.lng - punto1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(aRadianes(punto1.lat)) *
      Math.cos(aRadianes(punto2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function aRadianes(grados: number): number {
  return grados * (Math.PI / 180);
}

// Formatea distancia para mostrar al usuario
export function formatearDistancia(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Genera URL para abrir Google Maps con una dirección
export function generarUrlMaps(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
