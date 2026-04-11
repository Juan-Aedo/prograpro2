import { NextRequest, NextResponse } from "next/server";
import { actividades } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoria = searchParams.get("categoria");
  const busqueda = searchParams.get("q");
  const destacadas = searchParams.get("destacadas");

  let resultado = [...actividades];

  // Filtrar por categoría
  if (categoria) {
    resultado = resultado.filter((a) => a.categoria === categoria);
  }

  // Filtrar por búsqueda
  if (busqueda) {
    const termino = busqueda.toLowerCase();
    resultado = resultado.filter(
      (a) =>
        a.nombre.toLowerCase().includes(termino) ||
        a.descripcion.toLowerCase().includes(termino) ||
        a.tags.some((t) => t.toLowerCase().includes(termino))
    );
  }

  // Solo destacadas
  if (destacadas === "true") {
    resultado = resultado.filter((a) => a.destacada);
  }

  return NextResponse.json(resultado);
}
