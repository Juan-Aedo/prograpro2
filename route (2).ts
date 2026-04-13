import { NextRequest, NextResponse } from "next/server";
import {
  crearReserva,
  obtenerReservasUsuario,
  cancelarReserva,
} from "@/lib/bookings";

// ─────────────────────────────────────────────
//  POST /api/bookings — Crear reserva
//  Body: { actividadId, userId, fecha, personas }
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actividadId, userId, fecha, personas } = body;

    // Validaciones
    if (!actividadId || !userId || !fecha || !personas) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos requeridos: actividadId, userId, fecha, personas" },
        { status: 400 }
      );
    }

    if (typeof personas !== "number" || personas < 1 || personas > 20) {
      return NextResponse.json(
        { ok: false, message: "El número de personas debe estar entre 1 y 20" },
        { status: 400 }
      );
    }

    const resultado = crearReserva({ actividadId, userId, fecha, personas });

    if (!resultado.ok) {
      return NextResponse.json(
        { ok: false, message: resultado.error },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: true, data: resultado.booking },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/bookings POST] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
//  GET /api/bookings?userId=xxx — Listar reservas
// ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Se requiere userId" },
        { status: 400 }
      );
    }

    const reservas = obtenerReservasUsuario(userId);
    return NextResponse.json({ ok: true, data: reservas });
  } catch (err) {
    console.error("[api/bookings GET] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
//  DELETE /api/bookings — Cancelar reserva
//  Body: { bookingId, userId }
// ─────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, userId } = body;

    if (!bookingId || !userId) {
      return NextResponse.json(
        { ok: false, message: "Se requieren bookingId y userId" },
        { status: 400 }
      );
    }

    const resultado = cancelarReserva(bookingId, userId);

    if (!resultado.ok) {
      return NextResponse.json(
        { ok: false, message: resultado.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Reserva cancelada correctamente" });
  } catch (err) {
    console.error("[api/bookings DELETE] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
