import type { NivelPresupuesto } from "./types";

// ── Precio ─────────────────────────────────────
export function formatearPrecio(valor: number, moneda: string = "CLP"): string {
  if (valor === 0) return "Gratis";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function precioANivel(valor: number, moneda: string): NivelPresupuesto {
  if (moneda !== "CLP") return "medio";
  if (valor === 0) return "bajo";
  if (valor <= 5_000) return "bajo";
  if (valor <= 20_000) return "medio";
  if (valor <= 50_000) return "alto";
  return "sin-limite";
}

// ── CSS classnames ─────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ── Fechas ─────────────────────────────────────
export function formatearFecha(isoString: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoString));
}

export function fechaHoy(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Distancia Haversine ────────────────────────
export function distanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Texto ──────────────────────────────────────
export function capitalizar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
}

export function truncar(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

// ── Colores de categoría ───────────────────────
export const colorCategoria: Record<string, string> = {
  cine: "bg-purple-100 text-purple-700",
  teatro: "bg-rose-100 text-rose-700",
  parques: "bg-emerald-100 text-emerald-700",
  gastronomia: "bg-amber-100 text-amber-700",
  museos: "bg-blue-100 text-blue-700",
  deportes: "bg-orange-100 text-orange-700",
  musica: "bg-indigo-100 text-indigo-700",
  "aire-libre": "bg-teal-100 text-teal-700",
  nightlife: "bg-fuchsia-100 text-fuchsia-700",
  talleres: "bg-cyan-100 text-cyan-700",
};
