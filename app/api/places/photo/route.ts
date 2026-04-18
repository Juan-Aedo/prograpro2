import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const apiBase = process.env.GOOGLE_PLACES_API_BASE;
  if (!apiKey || !apiBase) {
    return new NextResponse("Places API no configurada", { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const w = Math.max(64, Math.min(1600, Number(searchParams.get("w")) || 800));

  if (!name || !name.startsWith("places/") || name.includes("..")) {
    return new NextResponse("Parámetro 'name' inválido", { status: 400 });
  }

  const upstreamUrl = `${apiBase}/${name}/media?maxWidthPx=${w}&key=${apiKey}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Error al obtener foto", {
        status: upstream.status || 502,
      });
    }
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Timeout al obtener foto", { status: 504 });
  }
}
