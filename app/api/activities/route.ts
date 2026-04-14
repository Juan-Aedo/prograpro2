import { NextRequest, NextResponse } from "next/server";
import { actividades } from "@/lib/mock-data";
import type { Activity } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const categoria   = searchParams.get("categoria");
  const busqueda    = searchParams.get("q");
  const destacadas  = searchParams.get("destacadas");
  const tendencia   = searchParams.get("tendencia");
  const precioMax   = searchParams.get("precio_max");
  const ordenarPor  = searchParams.get("orden"); // "precio" | "rating" | "relevancia"
  const limite      = searchParams.get("limite");

  let resultado: Activity[] = [...actividades];

  // Filtrar por categoría
  if (categoria) {
    resultado = resultado.filter((a) => a.categoria === categoria);
  }

  // Filtrar por texto libre (nombre, descripción, tags, dirección)
  if (busqueda) {
    const termino = busqueda.toLowerCase();
    resultado = resultado.filter(
      (a) =>
        a.nombre.toLowerCase().includes(termino) ||
        a.descripcion.toLowerCase().includes(termino) ||
        a.tags.some((t) => t.toLowerCase().includes(termino)) ||
        a.ubicacion.direccion.toLowerCase().includes(termino)
    );
  }

  // Solo actividades destacadas
  if (destacadas === "true") {
    resultado = resultado.filter((a) => a.destacada);
  }

  // Solo actividades en tendencia
  if (tendencia === "true") {
    resultado = resultado.filter((a) => a.enTendencia);
  }

  // Filtrar por precio máximo
  if (precioMax) {
    const max = parseFloat(precioMax);
    if (!isNaN(max)) {
      resultado = resultado.filter(
        (a) => a.precio.valor === 0 || a.precio.valor <= max
      );
    }
  }

  // Ordenar resultados
  if (ordenarPor === "precio") {
    resultado.sort((a, b) => a.precio.valor - b.precio.valor);
  } else if (ordenarPor === "rating") {
    resultado.sort((a, b) => b.rating - a.rating);
  }
  // "relevancia" (default) mantiene el orden original del array

  // Limitar resultados
  if (limite) {
    const n = parseInt(limite, 10);
    if (!isNaN(n) && n > 0) {
      resultado = resultado.slice(0, n);
    }
  }

  return NextResponse.json(resultado);
}
