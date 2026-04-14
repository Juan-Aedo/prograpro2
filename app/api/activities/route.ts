import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeActivity } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoria = searchParams.get("categoria");
  const busqueda = searchParams.get("q");
  const destacadas = searchParams.get("destacadas");
  const tendencia = searchParams.get("tendencia");

  const where: Record<string, unknown> = {};
  if (categoria) where.categoria = categoria;
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
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rows.map(serializeActivity));
}
