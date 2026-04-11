import { NextResponse } from "next/server";
import { climaMock } from "@/lib/mock-data";

export async function GET() {
  // TODO: Integrar con OpenWeatherMap API real
  // const API_KEY = process.env.OPENWEATHER_API_KEY;
  // const res = await fetch(`https://api.openweathermap.org/...`);

  return NextResponse.json(climaMock);
}
