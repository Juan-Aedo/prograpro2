import type { WeatherData, WeatherForecastItem } from "./types";

const SANTIAGO_LAT = -33.4489;
const SANTIAGO_LNG = -70.6693;

const MOCK: WeatherData = {
  temperatura: 22,
  sensacionTermica: 20,
  descripcion: "parcialmente nublado",
  icono: "partly-cloudy",
  humedad: 55,
  viento: 12,
  ciudad: "Santiago Centro",
  tempMin: 14,
  tempMax: 26,
  pronostico: [],
};

function mapWeatherCode(code: number): { icono: string; descripcion: string } {
  if (code === 0) return { icono: "clear", descripcion: "despejado" };
  if (code === 1) return { icono: "clear", descripcion: "mayormente despejado" };
  if (code === 2) return { icono: "partly-cloudy", descripcion: "parcialmente nublado" };
  if (code === 3) return { icono: "cloudy", descripcion: "nublado" };
  if (code === 45 || code === 48) return { icono: "fog", descripcion: "neblina" };
  if (code >= 51 && code <= 57) return { icono: "rain", descripcion: "llovizna" };
  if (code >= 61 && code <= 67) return { icono: "rain", descripcion: "lluvia" };
  if (code >= 71 && code <= 77) return { icono: "snow", descripcion: "nieve" };
  if (code >= 80 && code <= 82) return { icono: "rain", descripcion: "chubascos" };
  if (code === 85 || code === 86) return { icono: "snow", descripcion: "chubascos de nieve" };
  if (code >= 95 && code <= 99) return { icono: "storm", descripcion: "tormenta" };
  return { icono: "partly-cloudy", descripcion: "sin datos" };
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    weather_code?: number[];
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

export async function obtenerClima(lat?: number, lng?: number): Promise<WeatherData> {
  const latFinal = lat ?? SANTIAGO_LAT;
  const lngFinal = lng ?? SANTIAGO_LNG;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latFinal}&longitude=${lngFinal}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=2&wind_speed_unit=kmh`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { ...MOCK, actualizadoEn: new Date().toISOString() };

    const data: OpenMeteoResponse = await res.json();
    const current = data.current;
    if (!current) return { ...MOCK, actualizadoEn: new Date().toISOString() };

    const { icono, descripcion } = mapWeatherCode(current.weather_code ?? 0);

    const horas = data.hourly?.time ?? [];
    const temps = data.hourly?.temperature_2m ?? [];
    const codes = data.hourly?.weather_code ?? [];
    const ahora = new Date();
    const hoyStr = ahora.toISOString().split("T")[0];
    const horaActual = ahora.getHours();

    const pronostico: WeatherForecastItem[] = [];
    for (let i = 0; i < horas.length && pronostico.length < 6; i++) {
      const t = horas[i];
      if (!t) continue;
      const [fecha, tiempo] = t.split("T");
      if (fecha !== hoyStr) continue;
      const h = Number(tiempo?.slice(0, 2) ?? 0);
      if (h < horaActual) continue;
      if (h % 3 !== 0) continue;
      const info = mapWeatherCode(codes[i] ?? 0);
      pronostico.push({
        hora: tiempo?.slice(0, 5) ?? "",
        temperatura: Math.round(temps[i] ?? 0),
        icono: info.icono,
        descripcion: info.descripcion,
      });
    }

    return {
      temperatura: Math.round(current.temperature_2m ?? 0),
      sensacionTermica: Math.round(current.apparent_temperature ?? 0),
      descripcion,
      icono,
      humedad: Math.round(current.relative_humidity_2m ?? 0),
      viento: Math.round(current.wind_speed_10m ?? 0),
      ciudad: latFinal === SANTIAGO_LAT && lngFinal === SANTIAGO_LNG ? "Santiago Centro" : "Tu ubicación",
      tempMin: Math.round(data.daily?.temperature_2m_min?.[0] ?? current.temperature_2m ?? 0),
      tempMax: Math.round(data.daily?.temperature_2m_max?.[0] ?? current.temperature_2m ?? 0),
      pronostico,
      actualizadoEn: new Date().toISOString(),
    };
  } catch {
    return { ...MOCK, actualizadoEn: new Date().toISOString() };
  }
}

export function sugerirPorClima(clima: WeatherData): string[] {
  if (clima.temperatura > 25 && clima.descripcion.includes("despejado")) {
    return ["parques", "aire-libre", "deportes"];
  }
  if (clima.temperatura < 10 || clima.descripcion.includes("lluvia")) {
    return ["cine", "teatro", "museos", "gastronomia", "talleres"];
  }
  return ["parques", "musica", "gastronomia", "aire-libre"];
}
