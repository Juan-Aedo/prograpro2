import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Combina clases Tailwind sin conflictos ──
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Formatea precios en CLP o USD ──
export function formatearPrecio(valor: number, moneda: "CLP" | "USD"): string {
  if (valor === 0) return "Gratis";
  if (moneda === "CLP") {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(valor);
  }
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

// ── Formatea fecha ISO a string legible en español ──
export function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

// ── Trunca texto a N palabras ──
export function truncarTexto(texto: string, maxPalabras: number): string {
  const palabras = texto.split(" ");
  if (palabras.length <= maxPalabras) return texto;
  return palabras.slice(0, maxPalabras).join(" ") + "…";
}

// ── Capitaliza primera letra ──
export function capitalizar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
