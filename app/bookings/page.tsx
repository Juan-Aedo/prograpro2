"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarCheck,
  Clock,
  Users,
  MapPin,
  MoreHorizontal,
  Ticket,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { reservasMock } from "@/lib/mock-data";
import { formatearPrecio, cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";

const estadoConfig = {
  confirmada: {
    label: "Confirmada",
    color: "text-emerald-700 bg-emerald-50",
    icono: CheckCircle2,
  },
  pendiente: {
    label: "Pendiente",
    color: "text-amber-700 bg-amber-50",
    icono: AlertCircle,
  },
  cancelada: {
    label: "Cancelada",
    color: "text-red-700 bg-red-50",
    icono: XCircle,
  },
  completada: {
    label: "Completada",
    color: "text-surface-500 bg-surface-100",
    icono: CheckCircle2,
  },
};

type TabValue = "todas" | "confirmada" | "pendiente" | "completada";

export default function BookingsPage() {
  const [tabActiva, setTabActiva] = useState<TabValue>("todas");

  const reservasFiltradas =
    tabActiva === "todas"
      ? reservasMock
      : reservasMock.filter((r) => r.estado === tabActiva);

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: "todas", label: "Todas", count: reservasMock.length },
    {
      value: "confirmada",
      label: "Confirmadas",
      count: reservasMock.filter((r) => r.estado === "confirmada").length,
    },
    {
      value: "pendiente",
      label: "Pendientes",
      count: reservasMock.filter((r) => r.estado === "pendiente").length,
    },
    {
      value: "completada",
      label: "Completadas",
      count: reservasMock.filter((r) => r.estado === "completada").length,
    },
  ];

  return (
    <div className="pb-24 md:pb-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
            Mis Reservas
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Gestiona y revisa tus actividades reservadas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTabActiva(tab.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                tabActiva === tab.value
                  ? "bg-white text-surface-900 shadow-sm"
                  : "text-surface-500 hover:text-surface-700"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  tabActiva === tab.value
                    ? "bg-brand-100 text-brand-700"
                    : "bg-surface-200 text-surface-500"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista de reservas */}
        {reservasFiltradas.length > 0 ? (
          <div className="space-y-4 animate-stagger">
            {reservasFiltradas.map((reserva) => (
              <BookingCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarCheck className="h-12 w-12 text-surface-300 mb-4" />
            <h3 className="text-lg font-semibold text-surface-700">
              No hay reservas
            </h3>
            <p className="mt-1 text-sm text-surface-400 max-w-sm">
              Aún no tienes reservas en esta categoría.
            </p>
            <Link href="/explore" className="btn-primary mt-4">
              Explorar actividades
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ reserva }: { reserva: Booking }) {
  const estado = estadoConfig[reserva.estado];
  const IconoEstado = estado.icono;

  return (
    <Link
      href={`/activity/${reserva.actividadId}`}
      className="card block overflow-hidden cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Imagen */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
          <Image
            src={reserva.actividad.imagen}
            alt={reserva.actividad.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 192px"
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-surface-900 line-clamp-1">
                {reserva.actividad.nombre}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-surface-500">
                <MapPin className="h-3 w-3" />
                <span>{reserva.actividad.ubicacion.direccion}</span>
              </div>
            </div>
            <span className={cn("badge flex-shrink-0", estado.color)}>
              <IconoEstado className="h-3 w-3" />
              {estado.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-surface-500">
            <div className="flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>
                {new Date(reserva.fecha).toLocaleDateString("es-CL", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{reserva.hora}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{reserva.personas} personas</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-100">
            <span className="text-sm font-bold text-surface-900">
              {formatearPrecio(reserva.total)}
            </span>
            <span className="text-xs font-medium text-brand-600 flex items-center gap-1">
              Ver detalle
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
