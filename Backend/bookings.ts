import type { Booking, EstadoReserva } from "./types";
import { getActividadById } from "./data";

// ─────────────────────────────────────────────
//  SERVICIO DE RESERVAS
//  Almacenamiento en memoria (desarrollo).
//  En producción: reemplazar con llamadas a la DB.
// ─────────────────────────────────────────────

// Simulación de DB en memoria
let bookingsStore: Booking[] = [
  {
    id: "b1",
    actividadId: "a6",
    userId: "u1",
    fecha: "2025-04-20",
    personas: 2,
    total: 50000,
    moneda: "CLP",
    estado: "confirmada",
    createdAt: new Date().toISOString(),
  },
];

let nextId = 2;

// ── CRUD ───────────────────────────────────────

export function crearReserva(params: {
  actividadId: string;
  userId: string;
  fecha: string;
  personas: number;
}): { ok: boolean; booking?: Booking; error?: string } {
  const actividad = getActividadById(params.actividadId);

  if (!actividad) {
    return { ok: false, error: "Actividad no encontrada" };
  }

  if (!actividad.cuposDisponibles) {
    return { ok: false, error: "No hay cupos disponibles para esta actividad" };
  }

  if (
    actividad.cuposRestantes !== null &&
    actividad.cuposRestantes < params.personas
  ) {
    return {
      ok: false,
      error: `Solo quedan ${actividad.cuposRestantes} cupos disponibles`,
    };
  }

  // Validar fecha
  const fechaReserva = new Date(params.fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaReserva < hoy) {
    return { ok: false, error: "La fecha no puede ser en el pasado" };
  }

  const total = actividad.precio.esPorPersona
    ? actividad.precio.valor * params.personas
    : actividad.precio.valor;

  const booking: Booking = {
    id: `b${nextId++}`,
    actividadId: params.actividadId,
    userId: params.userId,
    fecha: params.fecha,
    personas: params.personas,
    total,
    moneda: actividad.precio.moneda,
    estado: "confirmada",
    createdAt: new Date().toISOString(),
  };

  bookingsStore.push(booking);

  // Actualizar cupos en la actividad (en producción esto sería una transacción DB)
  if (actividad.cuposRestantes !== null) {
    actividad.cuposRestantes = Math.max(
      0,
      actividad.cuposRestantes - params.personas
    );
    if (actividad.cuposRestantes === 0) {
      actividad.cuposDisponibles = false;
    }
  }

  return { ok: true, booking };
}

export function obtenerReservasUsuario(userId: string): Booking[] {
  return bookingsStore.filter((b) => b.userId === userId);
}

export function obtenerReservaPorId(id: string): Booking | undefined {
  return bookingsStore.find((b) => b.id === id);
}

export function cancelarReserva(
  id: string,
  userId: string
): { ok: boolean; error?: string } {
  const idx = bookingsStore.findIndex(
    (b) => b.id === id && b.userId === userId
  );
  if (idx === -1) {
    return { ok: false, error: "Reserva no encontrada" };
  }

  const booking = bookingsStore[idx];
  if (booking.estado === "cancelada") {
    return { ok: false, error: "La reserva ya está cancelada" };
  }

  // Devolver cupos a la actividad
  const actividad = getActividadById(booking.actividadId);
  if (actividad && actividad.cuposRestantes !== null) {
    actividad.cuposRestantes += booking.personas;
    actividad.cuposDisponibles = true;
  }

  bookingsStore[idx] = { ...booking, estado: "cancelada" };
  return { ok: true };
}

export function contarReservasPorActividad(actividadId: string): number {
  return bookingsStore.filter(
    (b) => b.actividadId === actividadId && b.estado === "confirmada"
  ).length;
}
