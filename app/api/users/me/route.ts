import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { serializeUser } from "@/lib/serializers";

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (Array.isArray(body.preferencias)) data.preferencias = body.preferencias;
  if (typeof body.nombre === "string" && body.nombre.trim()) {
    data.nombre = body.nombre.trim();
    data.avatar = body.nombre.trim().charAt(0).toUpperCase();
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json(serializeUser(updated));
}
