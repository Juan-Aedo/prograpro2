import { NextResponse } from "next/server";
import type { WeatherData } from "@/lib/types";
import { SANTIAGO_CIUDAD, SANTIAGO_LAT, SANTIAGO_LNG } from "@/lib/constants";
import {
  MOCK_WEATHER,
  OpenMeteoResponse,
  construirPronostico,
  construirPronosticoDiario,
  mapWeatherCode,
  urlOpenMeteo,
} from "@/lib/weather";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function nombreCiudad(lat: number, lng: number): Promise<string> {
  if (lat === SANTIAGO_LAT && lng === SANTIAGO_LNG) return SANTIAGO_CIUDAD;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=es`,
      { headers: { "User-Agent": "Panoramas-App" }, cache: "no-store" }
    );
    if (!res.ok) return "Tu ubicación";
    const data = await res.json();
    return (
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.suburb ??
      data.address?.county ??
      "Tu ubicación"
    );
  } catch {
    return "Tu ubicación";
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat = latParam ? Number(latParam) : SANTIAGO_LAT;
  const lng = lngParam ? Number(lngParam) : SANTIAGO_LNG;

  try {
    const [meteoRes, ciudad] = await Promise.all([
      fetch(urlOpenMeteo(lat, lng), { cache: "no-store" }),
      nombreCiudad(lat, lng),
    ]);

    if (!meteoRes.ok) throw new Error("Open-Meteo error");
    const data: OpenMeteoResponse = await meteoRes.json();

    const current = data.current;
    if (!current) throw new Error("Sin datos actuales");

    const { icono, descripcion } = mapWeatherCode(current.weather_code ?? 0);
    const pronostico = construirPronostico(data, { incluirFuturo: true });
    const pronosticoDiario = construirPronosticoDiario(data);

    const weather: WeatherData = {
      temperatura: Math.round(current.temperature_2m ?? 0),
      sensacionTermica: Math.round(current.apparent_temperature ?? 0),
      descripcion,
      icono,
      humedad: Math.round(current.relative_humidity_2m ?? 0),
      viento: Math.round(current.wind_speed_10m ?? 0),
      ciudad,
      tempMin: Math.round(data.daily?.temperature_2m_min?.[0] ?? current.temperature_2m ?? 0),
      tempMax: Math.round(data.daily?.temperature_2m_max?.[0] ?? current.temperature_2m ?? 0),
      pronostico,
      pronosticoDiario,
      actualizadoEn: new Date().toISOString(),
    };

    return NextResponse.json(weather, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { ...MOCK_WEATHER, actualizadoEn: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
