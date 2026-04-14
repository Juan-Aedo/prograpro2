import { NextRequest, NextResponse } from "next/server";
import { obtenerClima } from "@/lib/weather";

const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const lat = latParam ? parseFloat(latParam) : DEFAULT_LAT;
  const lng = lngParam ? parseFloat(lngParam) : DEFAULT_LNG;

  const validLat = isNaN(lat) ? DEFAULT_LAT : lat;
  const validLng = isNaN(lng) ? DEFAULT_LNG : lng;

  const clima = await obtenerClima(validLat, validLng);
  return NextResponse.json(clima);
}
