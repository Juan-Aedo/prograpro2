// Formatea precio en CLP
export function formatearPrecio(valor: number, moneda: string = "CLP"): string {
  if (valor === 0) return "Gratis";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 0,
  }).format(valor);
}

// Genera clases CSS condicionalmente
export function cn(...clases: (string | boolean | undefined | null)[]): string {
  return clases.filter(Boolean).join(" ");
}
