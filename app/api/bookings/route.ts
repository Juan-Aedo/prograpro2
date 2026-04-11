import { NextRequest, NextResponse } from "next/server";
import { reservasMock, actividades } from "@/lib/mock-data";
import type { Booking } from "@/lib/types";

// Obtener todas las reservas
export async function GET() {
  return NextResponse.json(reservasMock);
}

// Crear una nueva reserva
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { actividadId, fecha, hora, personas } = body;

  const actividad = actividades.find((a) => a.id === actividadId);

  if (!actividad) {
    return NextResponse.json(
      { error: "Actividad no encontrada" },
      { status: 404 }
    );
  }

  const total = actividad.precio.esPorPersona
    ? actividad.precio.valor * personas
    : actividad.precio.valor;

  const nuevaReserva: Booking = {
    id: `b${Date.now()}`,
    actividadId,
    actividad,
    fecha,
    hora,
    personas,
    estado: "pendiente",
    total,
  };

  return NextResponse.json(nuevaReserva, { status: 201 });
}
