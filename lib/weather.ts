import type { WeatherData } from "./types";
import { climaMock } from "./mock-data";

const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;

// ── Mapeo de WMO weather codes → icono ──
function wmoACondicion(code: number): string {
  if (code === 0) return "clear";
  if (code <= 2) return "partly-cloudy";
  if (code <= 3) return "cloudy";
  if (code <= 49) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 99) return "storm";
  return "cloudy";
}

function wmoADescripcion(code: number): string {
  const map: Record<number, string> = {
    0: "Despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna densa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia intensa",
    71: "Nevada ligera",
    73: "Nevada moderada",
    75: "Nevada intensa",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos violentos",
    95: "Tormenta eléctrica",
    99: "Tormenta con granizo",
  };
  const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (code >= keys[i]) return map[keys[i]];
  }
  return "Condición desconocida";
}

function obtenerNombreCiudad(lat: number, lng: number): string {
  const ciudades = [
    { nombre: "Santiago",   lat: -33.4489, lng: -70.6693, radio: 0.5 },
    { nombre: "Valparaíso", lat: -33.0472, lng: -71.6127, radio: 0.3 },
    { nombre: "Concepción", lat: -36.8201, lng: -73.0444, radio: 0.3 },
    { nombre: "La Serena",  lat: -29.9027, lng: -71.2519, radio: 0.3 },
  ];
  for (const c of ciudades) {
    if (Math.abs(lat - c.lat) < c.radio && Math.abs(lng - c.lng) < c.radio) {
      return c.nombre;
    }
  }
  return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
}

// Obtener clima actual desde Open-Meteo (gratis, sin API key)
export async function obtenerClima(
  lat: number = DEFAULT_LAT,
  lng: number = DEFAULT_LNG
): Promise<WeatherData> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&timezone=auto&forecast_days=1`;

    const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

    const data = await res.json();
    const current = data.current;

    return {
      temperatura: Math.round(current.temperature_2m),
      sensacionTermica: Math.round(current.apparent_temperature),
      humedad: Math.round(current.relative_humidity_2m),
      viento: Math.round(current.wind_speed_10m),
      descripcion: wmoADescripcion(current.weather_code ?? 0),
      icono: wmoACondicion(current.weather_code ?? 0),
      ciudad: obtenerNombreCiudad(lat, lng),
    };
  } catch {
    // Fallback al mock si Open-Meteo no está disponible
    return climaMock;
  }
}

// Determina el ícono según el estado del clima
export function obtenerIconoClima(icono: string): string {
  const iconos: Record<string, string> = {
    "clear": "Sun",
    "partly-cloudy": "CloudSun",
    "cloudy": "Cloud",
    "rain": "CloudRain",
    "storm": "CloudLightning",
    "snow": "Snowflake",
    "fog": "CloudFog",
  };
  return iconos[icono] ?? "Sun";
}

// Sugiere categorías de actividad basadas en el clima
export function sugerirPorClima(clima: WeatherData): string[] {
  if (clima.temperatura > 25 && (clima.icono === "clear" || clima.icono === "partly-cloudy")) {
    return ["parques", "aire-libre", "deportes"];
  }
  if (clima.icono === "rain" || clima.icono === "storm" || clima.temperatura < 10) {
    return ["cine", "teatro", "museos", "gastronomia", "talleres"];
  }
  return ["parques", "musica", "gastronomia", "aire-libre"];
}
