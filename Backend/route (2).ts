import { NextRequest, NextResponse } from "next/server";
import { generarRecomendaciones } from "@/lib/recommendations";
import type { RecommendationRequest, Categoria } from "@/lib/types";

// ── POST /api/recommendations ───────────────────────────────
// Body JSON: RecommendationRequest
//
// {
//   lat: -33.4489,
//   lng: -70.6693,
//   preferencias: ["museos", "gastronomia"],
//   presupuestoMax: 15000,   // opcional, CLP
//   radio: 10000,            // opcional, metros
//   limite: 8,               // opcional
//   incluirGratuitas: true   // opcional
// }
export async function POST(req: NextRequest) {
  try {
    let body: Partial<RecommendationRequest>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Body JSON inválido" },
        { status: 400 }
      );
    }

    // Validación de campos requeridos
    const { lat, lng, preferencias } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Se requieren lat y lng numéricos" },
        { status: 400 }
      );
    }

    if (!Array.isArray(preferencias) || preferencias.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos una preferencia de categoría" },
        { status: 400 }
      );
    }

    const categoriasValidas: Categoria[] = [
      "cine","teatro","parques","gastronomia","museos",
      "deportes","musica","aire-libre","nightlife","talleres",
    ];
    const preferenciasInvalidas = preferencias.filter(
      (p) => !categoriasValidas.includes(p as Categoria)
    );
    if (preferenciasInvalidas.length > 0) {
      return NextResponse.json(
        { error: `Categorías inválidas: ${preferenciasInvalidas.join(", ")}` },
        { status: 400 }
      );
    }

    // Construir request normalizado
    const solicitud: RecommendationRequest = {
      lat,
      lng,
      preferencias: preferencias as Categoria[],
      presupuestoMax: typeof body.presupuestoMax === "number" ? body.presupuestoMax : undefined,
      radio: typeof body.radio === "number" ? body.radio : 10000,
      limite: typeof body.limite === "number" ? Math.min(body.limite, 20) : 10,
      incluirGratuitas: body.incluirGratuitas ?? true,
    };

    // Ejecutar pipeline de recomendaciones
    const resultado = await generarRecomendaciones(solicitud);

    return NextResponse.json(resultado, {
      headers: {
        "Cache-Control": "no-store", // Tiempo real, no cachear
      },
    });
  } catch (error) {
    console.error("[/api/recommendations] Error:", error);
    return NextResponse.json(
      { error: "Error generando recomendaciones. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

// ── GET /api/recommendations (versión simple por query params) ──
// Para uso rápido desde el frontend sin cuerpo POST
// ?lat=-33.4&lng=-70.6&preferencias=museos,cine&limite=6
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = parseFloat(searchParams.get("lat") ?? "NaN");
    const lng = parseFloat(searchParams.get("lng") ?? "NaN");
    const prefStr = searchParams.get("preferencias") ?? "";
    const preferencias = prefStr
      ? (prefStr.split(",").map((s) => s.trim()) as Categoria[])
      : (["museos", "parques", "gastronomia"] as Categoria[]);
    const limite = parseInt(searchParams.get("limite") ?? "8", 10);
    const radio = parseInt(searchParams.get("radio") ?? "10000", 10);
    const presupuestoMax = searchParams.get("presupuesto")
      ? parseInt(searchParams.get("presupuesto")!, 10)
      : undefined;

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Se requieren lat y lng válidos" },
        { status: 400 }
      );
    }

    const solicitud: RecommendationRequest = {
      lat, lng, preferencias, limite, radio, presupuestoMax,
    };

    const resultado = await generarRecomendaciones(solicitud);

    return NextResponse.json(resultado, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[/api/recommendations GET] Error:", error);
    return NextResponse.json(
      { error: "Error generando recomendaciones" },
      { status: 500 }
    );
  }
}
