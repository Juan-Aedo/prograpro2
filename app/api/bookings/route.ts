import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { serializeBooking } from "@/lib/serializers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { activity: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings.map(serializeBooking));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const { actividadId, fecha, hora, personas } = body as {
    actividadId?: string;
    fecha?: string;
    hora?: string;
    personas?: number;
  };

  if (!actividadId || !fecha || !personas) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id: actividadId } });
  if (!activity) {
    return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
  }

  const total = activity.esPorPersona ? activity.valor * personas : activity.valor;

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      activityId: activity.id,
      fecha,
      hora: hora ?? activity.apertura,
      personas,
      estado: "pendiente",
      total,
    },
    include: { activity: true },
  });

  return NextResponse.json(serializeBooking(booking), { status: 201 });
}
