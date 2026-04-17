import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeActivity } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoria = searchParams.get("categoria");
  const categoriasParam = searchParams.get("categorias"); // múltiples: "cine,museos,parques"
  const busqueda = searchParams.get("q");
  const destacadas = searchParams.get("destacadas");
  const tendencia = searchParams.get("tendencia");
  const sort = searchParams.get("sort"); // "rating" | default createdAt
  const limit = searchParams.get("limit");

  const where: Record<string, unknown> = {};
  if (categoria) where.categoria = categoria;
  if (categoriasParam) {
    const cats = categoriasParam.split(",").map((c) => c.trim()).filter(Boolean);
    if (cats.length > 0) where.categoria = { in: cats };
  }
  if (destacadas === "true") where.destacada = true;
  if (tendencia === "true") where.enTendencia = true;
  if (busqueda && busqueda.trim()) {
    const q = busqueda.trim();
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { descripcion: { contains: q, mode: "insensitive" } },
      { direccion: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
  }

  const rows = await prisma.activity.findMany({
    where,
    orderBy: sort === "rating" ? { rating: "desc" } : { createdAt: "asc" },
    take: limit ? parseInt(limit, 10) : undefined,
  });
  return NextResponse.json(rows.map(serializeActivity));
}
