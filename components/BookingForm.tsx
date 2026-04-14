"use client";

import { useState } from "react";
import { Calendar, Users, Ticket, Check, AlertCircle } from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatearPrecio } from "@/lib/utils";

interface BookingFormProps {
  actividad: Activity;
}

export function BookingForm({ actividad }: BookingFormProps) {
  const [fecha, setFecha] = useState("");
  const [personas, setPersonas] = useState(1);
  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = actividad.precio.esPorPersona
    ? actividad.precio.valor * personas
    : actividad.precio.valor;

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actividadId: actividad.id,
          fecha,
          hora: actividad.horario.apertura,
          personas,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear la reserva");
      }

      setReservaExitosa(true);
      setTimeout(() => setReservaExitosa(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear la reserva");
    } finally {
      setCargando(false);
    }
  };

  const esGratis = actividad.precio.valor === 0;

  return (
    <div className="card p-5">
      <h3 className="font-display text-xl font-bold text-ink-900 mb-4">
        {esGratis ? "Planificar Visita" : "Reservar"}
      </h3>

      {reservaExitosa ? (
        <div className="flex flex-col items-center gap-3 py-8 animate-scale-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 border border-teal-300">
            <Check className="h-7 w-7 text-teal-600" />
          </div>
          <p className="text-sm font-semibold text-teal-700">¡Reserva confirmada!</p>
          <p className="text-xs text-ink-500">Revisa tus reservas para más detalles</p>
        </div>
      ) : (
        <form onSubmit={handleReservar} className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="input-field cursor-pointer"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 mb-1.5">
              <Users className="h-3.5 w-3.5" />
              Personas
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPersonas(Math.max(1, personas - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-700 hover:bg-cream-200 hover:border-ink-400 transition-all duration-150 cursor-pointer font-bold"
              >
                −
              </button>
              <span className="text-lg font-semibold text-ink-900 min-w-[2ch] text-center">
                {personas}
              </span>
              <button
                type="button"
                onClick={() => setPersonas(Math.min(10, personas + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-700 hover:bg-cream-200 hover:border-ink-400 transition-all duration-150 cursor-pointer font-bold"
              >
                +
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!esGratis && (
            <div className="flex items-center justify-between border-t border-ink-900/6 pt-4">
              <span className="text-sm text-ink-500">Total</span>
              <span className="font-display text-2xl font-bold text-ink-900">
                {formatearPrecio(total, actividad.precio.moneda)}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cargando ? (
              <span className="animate-pulse-soft">Procesando...</span>
            ) : (
              <>
                <Ticket className="h-4 w-4" />
                {esGratis ? "Confirmar visita" : "Reservar ahora"}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
