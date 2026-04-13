"use client";

import Link from "next/link";
import {
  Film, Drama, Trees, UtensilsCrossed, Landmark,
  Dumbbell, Music, Mountain, Wine, Palette,
} from "lucide-react";

const iconosMapa: Record<string, React.ElementType> = {
  cine:         Film,
  teatro:       Drama,
  parques:      Trees,
  gastronomia:  UtensilsCrossed,
  museos:       Landmark,
  deportes:     Dumbbell,
  musica:       Music,
  "aire-libre": Mountain,
  nightlife:    Wine,
  talleres:     Palette,
};

interface CategoryScrollerProps {
  categorias: [string, string][];
}

// Chip individual reutilizable
function CategoryChip({ keyVal, label }: { keyVal: string; label: string }) {
  const Icono = iconosMapa[keyVal] ?? Film;
  return (
    <Link
      href={`/explore?categoria=${keyVal}`}
      className="flex items-center gap-2 rounded-full border border-ink-900/12 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 whitespace-nowrap
        transition-all duration-150 ease-out
        hover:border-ink-900/30 hover:shadow-offset-sm hover:-translate-x-0.5 hover:-translate-y-0.5
        cursor-pointer flex-shrink-0"
    >
      <Icono className="h-4 w-4 text-teal-500" />
      {label}
    </Link>
  );
}

export function CategoryScroller({ categorias }: CategoryScrollerProps) {
  // Duplicamos los items para el efecto de loop continuo sin salto
  const items = [...categorias, ...categorias];
  const itemsRev = [...categorias].reverse();
  const itemsRevLoop = [...itemsRev, ...itemsRev];

  return (
    <div className="space-y-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_80px,black_calc(100%-80px),transparent)]">
      {/* Fila 1 — izquierda a derecha */}
      <div className="flex gap-3 marquee-track animate-marquee">
        {items.map(([key, label], i) => (
          <CategoryChip key={`row1-${key}-${i}`} keyVal={key} label={label} />
        ))}
      </div>

      {/* Fila 2 — derecha a izquierda */}
      <div className="flex gap-3 marquee-track animate-marquee-rev">
        {itemsRevLoop.map(([key, label], i) => (
          <CategoryChip key={`row2-${key}-${i}`} keyVal={key} label={label} />
        ))}
      </div>
    </div>
  );
}
