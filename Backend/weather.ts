import type { WeatherData, CondicionClimatica } from "./types";

// ─────────────────────────────────────────────
//  SERVICIO DE CLIMA
//  Usa Open-Meteo (gratuito, sin API key).
//  Fallback a datos estáticos si hay error de red.
// ─────────────────────────────────────────────

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

// Mapeo código WMO → CondicionClimatica
function wmoAIcono(code: number): CondicionClimatica {
  if (code === 0) return "clear";
  if (code <= 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code >= 45 && code <= 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95 && code <= 99) return "storm";
  return "partly-cloudy";
}

function wmoADescripcion(code: number): string {
  if (code === 0) return "Despejado";
  if (code === 1) return "Mayormente despejado";
  if (code === 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code >= 45 && code <= 48) return "Neblina";
  if (code >= 51 && code <= 55) return "Llovizna";
  if (code >= 61 && code <= 65) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code >= 95 && code <= 99) return "Tormenta eléctrica";
  return "Variable";
}

// Santiago de Chile — coordenadas por defecto
const DEFAULT_LAT = -33.4569;
const DEFAULT_LNG = -70.6483;

export async function obtenerClima(
  lat: number = DEFAULT_LAT,
  lng: number = DEFAULT_LNG,
  ciudad: string = "Santiago"
): Promise<WeatherData> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      current: [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "wind_speed_10m",
        "weather_code",
      ].join(","),
      timezone: "America/Santiago",
      forecast_days: "1",
    });

    const res = await fetch(`${OPEN_METEO_URL}?${params}`, {
      next: { revalidate: 1800 }, // Revalidar cada 30 min (Next.js)
    });

    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

    const json = await res.json();
    const c = json.current;
    const code: number = c.weather_code;

    return {
      ciudad,
      temperatura: Math.round(c.temperature_2m),
      sensacionTermica: Math.round(c.apparent_temperature),
      humedad: Math.round(c.relative_humidity_2m),
      viento: Math.round(c.wind_speed_10m),
      descripcion: wmoADescripcion(code),
      icono: wmoAIcono(code),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[clima] Error al obtener datos:", err);
    // Datos de fallback representativos de Santiago en otoño
    return climaFallback(ciudad);
  }
}

export function climaFallback(ciudad = "Santiago"): WeatherData {
  return {
    ciudad,
    temperatura: 18,
    sensacionTermica: 16,
    humedad: 65,
    viento: 12,
    descripcion: "Parcialmente nublado",
    icono: "partly-cloudy",
    timestamp: new Date().toISOString(),
  };
}

// Helper: ¿es buen día para actividades al aire libre?
export function esBuenDiaExterior(clima: WeatherData): boolean {
  return ["clear", "partly-cloudy"].includes(clima.icono);
}
