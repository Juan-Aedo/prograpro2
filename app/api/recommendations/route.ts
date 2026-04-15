import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeActivity } from "@/lib/serializers";
import { obtenerClima } from "@/lib/weather";
import {
  calcularDistanciaKm,
  formatearDistancia,
  generarUrlMapsDestino,
} from "@/lib/maps";
import type {
  Activity,
  ActivityCategory,
  RecommendationRequest,
  RecommendationResponse,
  EnrichedActivity,
} from "@/lib/types";

// ── Categorías que requieren buen clima (actividades al aire libre) ──
const CATEGORIAS_EXTERIOR: ActivityCategory[] = ["parques", "aire-libre", "deportes"];

// ── Compatibilidad climática por heurística de categoría ──
function esCompatibleConClima(
  actividad: Activity,
  icono: string,
  temperatura: number
): { compatible: boolean; razon: string } {
  const esExterior = CATEGORIAS_EXTERIOR.includes(actividad.categoria);

  if (esExterior && (icono === "rain" || icono === "storm")) {
    return { compatible: false, razon: "Actividad al aire libre no recomendada con lluvia" };
  }
  if (esExterior && icono === "snow") {
    return { compatible: false, razon: "No recomendado con nevada" };
  }
  if (esExterior && temperatura < 4) {
    return { compatible: false, razon: "Temperatura demasiado baja para actividad exterior" };
  }
  return { compatible: true, razon: "" };
}

// ── Motor de scoring (0–100 puntos) ──
function calcularScore(
  actividad: Activity,
  preferencias: ActivityCategory[],
  icono: string,
  temperatura: number,
  distanciaKm: number,
  radioKm: number
): number {
  let score = 0;

  // 1. Coincidencia de preferencias (40 pts)
  if (preferencias.length === 0 || preferencias.includes(actividad.categoria)) {
    score += 40;
  }

  // 2. Compatibilidad climática (25 pts)
  const { compatible } = esCompatibleConClima(actividad, icono, temperatura);
  if (compatible) score += 25;

  // 3. Rating normalizado: rango 3–5 → 0–15 pts
  score += Math.max(0, ((actividad.rating - 3) / 2) * 15);

  // 4. Proximidad (10 pts) — cuanto más cerca, más puntos
  const proximidad = radioKm > 0 ? Math.max(0, 1 - distanciaKm / radioKm) : 1;
  score += proximidad * 10;

  // 5. En tendencia (5 pts)
  if (actividad.enTendencia) score += 5;

  // 6. Gratuito (5 pts)
  if (actividad.precio.valor === 0) score += 5;

  // Bonus: categoría interior con mal clima (+8 pts)
  const esExterior = CATEGORIAS_EXTERIOR.includes(actividad.categoria);
  if (!esExterior && (icono === "rain" || icono === "storm" || icono === "snow")) {
    score += 8;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ── Genera texto de razón de recomendación ──
function generarRazon(
  actividad: Activity,
  icono: string,
  temperatura: number,
  distanciaTexto: string
): string {
  const partes: string[] = [];

  const etiquetas: Record<string, string> = {
    cine: "Perfecta para una tarde de cine",
    teatro: "Una velada cultural imperdible",
    parques: "Disfruta los espacios verdes",
    gastronomia: "Una experiencia gastronómica top",
    museos: "Cultura e historia a tu alcance",
    deportes: "Actívate hoy",
    musica: "Música en vivo que no te puedes perder",
    "aire-libre": "Naturaleza y aventura te esperan",
    nightlife: "La mejor noche de la ciudad",
    talleres: "Aprende algo nuevo hoy",
  };
  partes.push(etiquetas[actividad.categoria] ?? "Gran opción para hoy");

  const esExterior = CATEGORIAS_EXTERIOR.includes(actividad.categoria);
  if (!esExterior && (icono === "rain" || icono === "storm")) {
    partes.push("perfecta para un día lluvioso");
  } else if (icono === "clear" && temperatura >= 18) {
    partes.push("condiciones perfectas hoy");
  } else if (icono === "partly-cloudy") {
    partes.push("buen día para salir");
  }

  partes.push(`a solo ${distanciaTexto}`);

  return partes.join(" · ");
}

// ── Handler principal ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lat,
      lng,
      preferencias = [],
      presupuestoMax,
      radio = 10000,
      limite = 10,
    }: RecommendationRequest = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Se requieren coordenadas lat y lng" },
        { status: 400 }
      );
    }

    // 1. Clima actual desde Open-Meteo (gratis)
    const clima = await obtenerClima(lat, lng);
    const radioKm = radio / 1000;

    // 2. Cargar actividades desde DB y filtrar por presupuesto
    const actividadesRaw = await prisma.activity.findMany();
    let candidatos: Activity[] = actividadesRaw.map(serializeActivity);
    if (presupuestoMax !== undefined) {
      candidatos = candidatos.filter(
        (a) => a.precio.valor === 0 || a.precio.valor <= presupuestoMax
      );
    }

    // 3. Calcular distancias y filtrar por radio
    const candidatosConDist = candidatos
      .map((a) => ({
        actividad: a,
        km: calcularDistanciaKm(lat, lng, a.ubicacion.lat, a.ubicacion.lng),
      }))
      .filter(({ km }) => radioKm === 0 || km <= radioKm);

    const totalEncontradas = candidatosConDist.length;
    let filtradasPorClima = 0;

    // 4. Enriquecer: scoring + razón + info de distancia
    const enriquecidas: EnrichedActivity[] = candidatosConDist.map(
      ({ actividad, km }) => {
        const { compatible, razon } = esCompatibleConClima(
          actividad,
          clima.icono,
          clima.temperatura
        );
        if (!compatible) filtradasPorClima++;

        const distanciaTexto = formatearDistancia(km);
        const score = calcularScore(
          actividad,
          preferencias,
          clima.icono,
          clima.temperatura,
          km,
          radioKm
        );
        const razonRecomendacion = compatible
          ? generarRazon(actividad, clima.icono, clima.temperatura, distanciaTexto)
          : razon;

        return {
          ...actividad,
          scoreRelevancia: score,
          razonRecomendacion,
          compatibleConClima: compatible,
          distanciaTexto,
          distanciaMetros: Math.round(km * 1000),
          urlMaps: generarUrlMapsDestino(
            actividad.ubicacion.lat,
            actividad.ubicacion.lng,
            actividad.nombre
          ),
        };
      }
    );

    // 5. Ordenar: compatibles primero, luego por score descendente
    enriquecidas.sort((a, b) => {
      if (a.compatibleConClima && !b.compatibleConClima) return -1;
      if (!a.compatibleConClima && b.compatibleConClima) return 1;
      return b.scoreRelevancia - a.scoreRelevancia;
    });

    const response: RecommendationResponse = {
      actividades: enriquecidas.slice(0, limite),
      clima,
      totalEncontradas,
      filtradasPorClima,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Error al generar recomendaciones" },
      { status: 500 }
    );
  }
}
