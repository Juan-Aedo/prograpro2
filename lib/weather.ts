import type { WeatherData } from "./types";
import { climaMock } from "./mock-data";

// Obtener clima actual (usa mock mientras no haya API key)
export async function obtenerClima(
  _lat?: number,
  _lng?: number
): Promise<WeatherData> {
  // TODO: Integrar OpenWeatherMap API con key real
  // const API_KEY = process.env.OPENWEATHER_API_KEY;
  // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=es`;
  // const res = await fetch(url);
  // return transformarRespuesta(await res.json());

  // Simula latencia de red
  await new Promise((resolve) => setTimeout(resolve, 300));
  return climaMock;
}

// Determina el ícono SVG según el estado del clima
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

// Sugiere tipo de actividad basado en el clima
export function sugerirPorClima(clima: WeatherData): string[] {
  if (clima.temperatura > 25 && clima.descripcion.includes("sol")) {
    return ["parques", "aire-libre", "deportes"];
  }
  if (clima.temperatura < 10 || clima.descripcion.includes("lluvia")) {
    return ["cine", "teatro", "museos", "gastronomia", "talleres"];
  }
  return ["parques", "musica", "gastronomia", "aire-libre"];
}
