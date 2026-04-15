import type { WeatherData } from "./types";

const MOCK: WeatherData = {
  temperatura: 22,
  sensacionTermica: 20,
  descripcion: "Parcialmente nublado",
  icono: "partly-cloudy",
  humedad: 55,
  viento: 12,
  ciudad: "Santiago",
};

function mapIcon(main: string): string {
  const m = main.toLowerCase();
  if (m.includes("clear")) return "clear";
  if (m.includes("cloud") && m.includes("few")) return "partly-cloudy";
  if (m.includes("cloud")) return "cloudy";
  if (m.includes("rain") || m.includes("drizzle")) return "rain";
  if (m.includes("thunder")) return "storm";
  if (m.includes("snow")) return "snow";
  if (m.includes("fog") || m.includes("mist") || m.includes("haze")) return "fog";
  return "partly-cloudy";
}

export async function obtenerClima(): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = process.env.OPENWEATHER_CITY ?? "Santiago,cl";
  if (!apiKey) return MOCK;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&lang=es&appid=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return MOCK;
    const data = await res.json();
    return {
      temperatura: Math.round(data.main?.temp ?? 0),
      sensacionTermica: Math.round(data.main?.feels_like ?? 0),
      descripcion: data.weather?.[0]?.description ?? "Sin datos",
      icono: mapIcon(data.weather?.[0]?.main ?? ""),
      humedad: data.main?.humidity ?? 0,
      viento: Math.round((data.wind?.speed ?? 0) * 3.6),
      ciudad: data.name ?? "Santiago",
    };
  } catch {
    return MOCK;
  }
}

export function sugerirPorClima(clima: WeatherData): string[] {
  if (clima.temperatura > 25 && clima.descripcion.includes("sol")) {
    return ["parques", "aire-libre", "deportes"];
  }
  if (clima.temperatura < 10 || clima.descripcion.includes("lluvia")) {
    return ["cine", "teatro", "museos", "gastronomia", "talleres"];
  }
  return ["parques", "musica", "gastronomia", "aire-libre"];
}
