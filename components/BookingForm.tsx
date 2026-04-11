"use client";

import { useState } from "react";
import { Calendar, Users, Ticket, Check } from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatearPrecio } from "@/lib/utils";

interface BookingFormProps {
  actividad: Activity;
}

export function BookingForm({ actividad }: BookingFormProps) {
  const [fecha, setFecha] = useState("");
  const [personas, setPersonas] = useState(1);
  const [reservaExitosa, setReservaExitosa] = useState(false);

  const total = actividad.precio.esPorPersona
    ? actividad.precio.valor * personas
    : actividad.precio.valor;

  const handleReservar = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula reserva exitosa
    setReservaExitosa(true);
    setTimeout(() => setReservaExitosa(false), 3000);
  };

  const esGratis = actividad.precio.valor === 0;

  return (
    <div className="card p-5">
      <h3 className="text-lg font-bold text-surface-900 mb-4">
        {esGratis ? "Planificar Visita" : "Reservar"}
      </h3>

      {reservaExitosa ? (
        <div className="flex flex-col items-center gap-3 py-8 animate-scale-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-emerald-700">
            ¡Reserva confirmada!
          </p>
          <p className="text-xs text-surface-500">
            Revisa tus reservas para más detalles
          </p>
        </div>
      ) : (
        <form onSubmit={handleReservar} className="space-y-4">
          {/* Fecha */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-surface-500 mb-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="input-field cursor-pointer"
            />
          </div>

          {/* Personas */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-surface-500 mb-1.5">
              <Users className="h-3.5 w-3.5" />
              Personas
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPersonas(Math.max(1, personas - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="text-lg font-semibold text-surface-900 min-w-[2ch] text-center">
                {personas}
              </span>
              <button
                type="button"
                onClick={() => setPersonas(Math.min(10, personas + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          {!esGratis && (
            <div className="flex items-center justify-between border-t border-surface-100 pt-4">
              <span className="text-sm text-surface-500">Total</span>
              <span className="text-xl font-bold text-surface-900">
                {formatearPrecio(total, actividad.precio.moneda)}
              </span>
            </div>
          )}

          {/* Botón */}
          <button type="submit" className="btn-primary w-full py-3">
            <Ticket className="h-4 w-4" />
            {esGratis ? "Confirmar visita" : "Reservar ahora"}
          </button>
        </form>
      )}
    </div>
  );
}
