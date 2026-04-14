"use client";

import { useState } from "react";
import { Calendar, Users, Ticket, Check } from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatearPrecio } from "@/lib/utils";

//IMPORTANTE ESTA ES LA CONEXIÓN FRONT Y BACK////
import { useWeather } from "@/lib/hooks/useWeather";
import { useRecommendations } from "@/lib/hooks/useRecommendations";

const { clima, lat, lng } = useWeather(); // detecta ubicación automáticamente
const { data, fetch } = useRecommendations();

// Llamar al motor:
fetch({ lat, lng, preferencias: ["museos", "gastronomia"] });
////////////////////////////////////////////////

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
    setReservaExitosa(true);
    setTimeout(() => setReservaExitosa(false), 3000);
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
              type="date" value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required className="input-field cursor-pointer"
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
              <span className="text-lg font-semibold text-ink-900 min-w-[2ch] text-center">{personas}</span>
              <button
                type="button"
                onClick={() => setPersonas(Math.min(10, personas + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-700 hover:bg-cream-200 hover:border-ink-400 transition-all duration-150 cursor-pointer font-bold"
              >
                +
              </button>
            </div>
          </div>

          {!esGratis && (
            <div className="flex items-center justify-between border-t border-ink-900/6 pt-4">
              <span className="text-sm text-ink-500">Total</span>
              <span className="font-display text-2xl font-bold text-ink-900">
                {formatearPrecio(total, actividad.precio.moneda)}
              </span>
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3">
            <Ticket className="h-4 w-4" />
            {esGratis ? "Confirmar visita" : "Reservar ahora"}
          </button>
        </form>
      )}
    </div>
  );
}
