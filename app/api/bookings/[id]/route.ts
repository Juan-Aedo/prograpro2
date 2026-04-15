import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { serializeBooking } from "@/lib/serializers";

const ESTADOS_VALIDOS = ["confirmada", "pendiente", "cancelada", "completada"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const existing = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.estado) {
    if (!ESTADOS_VALIDOS.includes(body.estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    data.estado = body.estado;
  }
  if (body.fecha) data.fecha = body.fecha;
  if (body.hora) data.hora = body.hora;
  if (typeof body.personas === "number") data.personas = body.personas;

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data,
    include: { activity: true },
  });
  return NextResponse.json(serializeBooking(updated));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const existing = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
