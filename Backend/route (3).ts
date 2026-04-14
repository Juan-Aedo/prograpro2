import { NextRequest, NextResponse } from "next/server";
import { obtenerActividadPorId } from "@/lib/recommendations";
import type { Booking } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// En producción esto debería ser una base de datos real
// (PostgreSQL, Prisma, Supabase, etc.).
// Por ahora usamos un Map en memoria (se resetea al reiniciar).
// ─────────────────────────────────────────────────────────────
const reservasDB = new Map<string, Booking>();

function generarId(): string {
  return `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── GET /api/bookings ── Lista todas las reservas ──
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const reserva = reservasDB.get(id);
      if (!reserva) {
        return NextResponse.json(
          { error: `Reserva '${id}' no encontrada` },
          { status: 404 }
        );
      }
      return NextResponse.json(reserva);
    }

    const todas = Array.from(reservasDB.values()).sort(
      (a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime()
    );
    return NextResponse.json({ reservas: todas, total: todas.length });
  } catch (error) {
    console.error("[/api/bookings GET]", error);
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}

// ── POST /api/bookings ── Crea una reserva ──
// Body: { actividadId, fecha, personas }
export async function POST(req: NextRequest) {
  try {
    let body: { actividadId?: string; fecha?: string; personas?: number };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    const { actividadId, fecha, personas } = body;

    // Validaciones
    if (!actividadId || typeof actividadId !== "string") {
      return NextResponse.json({ error: "actividadId requerido" }, { status: 400 });
    }
    if (!fecha || typeof fecha !== "string") {
      return NextResponse.json({ error: "fecha requerida (YYYY-MM-DD)" }, { status: 400 });
    }
    if (!personas || typeof personas !== "number" || personas < 1 || personas > 20) {
      return NextResponse.json({ error: "personas debe ser un número entre 1 y 20" }, { status: 400 });
    }

    // Verificar que la fecha no sea pasada
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaReserva < hoy) {
      return NextResponse.json({ error: "La fecha debe ser hoy o en el futuro" }, { status: 400 });
    }

    // Obtener la actividad
    const actividad = obtenerActividadPorId(actividadId);
    if (!actividad) {
      return NextResponse.json(
        { error: `Actividad '${actividadId}' no encontrada` },
        { status: 404 }
      );
    }

    // Verificar disponibilidad según día de semana
    const diaSemana = fechaReserva.getDay();
    if (!actividad.horario.diasSemana.includes(diaSemana)) {
      const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
      return NextResponse.json(
        { error: `${actividad.nombre} no abre los ${dias[diaSemana]}s` },
        { status: 409 }
      );
    }

    // Calcular total
    const total = actividad.precio.esPorPersona
      ? actividad.precio.valor * personas
      : actividad.precio.valor;

    // Crear reserva
    const reserva: Booking = {
      id: generarId(),
      actividadId,
      actividadNombre: actividad.nombre,
      fecha,
      personas,
      totalPagado: total,
      moneda: actividad.precio.moneda,
      estado: "confirmada",
      creadaEn: new Date().toISOString(),
    };

    reservasDB.set(reserva.id, reserva);

    return NextResponse.json(reserva, { status: 201 });
  } catch (error) {
    console.error("[/api/bookings POST]", error);
    return NextResponse.json({ error: "Error al crear reserva" }, { status: 500 });
  }
}

// ── PATCH /api/bookings?id=bk_xxx ── Cancela una reserva ──
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id de reserva requerido" }, { status: 400 });
    }

    const reserva = reservasDB.get(id);
    if (!reserva) {
      return NextResponse.json({ error: `Reserva '${id}' no encontrada` }, { status: 404 });
    }

    if (reserva.estado === "cancelada") {
      return NextResponse.json({ error: "La reserva ya estaba cancelada" }, { status: 409 });
    }

    const actualizada: Booking = { ...reserva, estado: "cancelada" };
    reservasDB.set(id, actualizada);

    return NextResponse.json(actualizada);
  } catch (error) {
    console.error("[/api/bookings PATCH]", error);
    return NextResponse.json({ error: "Error al cancelar reserva" }, { status: 500 });
  }
}

// ── DELETE /api/bookings?id=bk_xxx ── Elimina una reserva ──
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    const existia = reservasDB.delete(id);
    if (!existia) {
      return NextResponse.json({ error: `Reserva '${id}' no encontrada` }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Reserva eliminada correctamente" });
  } catch (error) {
    console.error("[/api/bookings DELETE]", error);
    return NextResponse.json({ error: "Error al eliminar reserva" }, { status: 500 });
  }
}
