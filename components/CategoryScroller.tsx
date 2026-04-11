"use client";

import Link from "next/link";
import {
  Film,
  Drama,
  Trees,
  UtensilsCrossed,
  Landmark,
  Dumbbell,
  Music,
  Mountain,
  Wine,
  Palette,
} from "lucide-react";

const iconosMapa: Record<string, React.ElementType> = {
  cine: Film,
  teatro: Drama,
  parques: Trees,
  gastronomia: UtensilsCrossed,
  museos: Landmark,
  deportes: Dumbbell,
  musica: Music,
  "aire-libre": Mountain,
  nightlife: Wine,
  talleres: Palette,
};

const coloresMapa: Record<string, { bg: string; text: string; hover: string }> = {
  cine: { bg: "bg-purple-50", text: "text-purple-600", hover: "hover:bg-purple-100" },
  teatro: { bg: "bg-rose-50", text: "text-rose-600", hover: "hover:bg-rose-100" },
  parques: { bg: "bg-emerald-50", text: "text-emerald-600", hover: "hover:bg-emerald-100" },
  gastronomia: { bg: "bg-amber-50", text: "text-amber-600", hover: "hover:bg-amber-100" },
  museos: { bg: "bg-blue-50", text: "text-blue-600", hover: "hover:bg-blue-100" },
  deportes: { bg: "bg-orange-50", text: "text-orange-600", hover: "hover:bg-orange-100" },
  musica: { bg: "bg-indigo-50", text: "text-indigo-600", hover: "hover:bg-indigo-100" },
  "aire-libre": { bg: "bg-teal-50", text: "text-teal-600", hover: "hover:bg-teal-100" },
  nightlife: { bg: "bg-fuchsia-50", text: "text-fuchsia-600", hover: "hover:bg-fuchsia-100" },
  talleres: { bg: "bg-cyan-50", text: "text-cyan-600", hover: "hover:bg-cyan-100" },
};

interface CategoryScrollerProps {
  categorias: [string, string][];
}

export function CategoryScroller({ categorias }: CategoryScrollerProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {categorias.map(([key, label]) => {
        const Icono = iconosMapa[key] ?? Film;
        const colores = coloresMapa[key] ?? { bg: "bg-surface-50", text: "text-surface-600", hover: "hover:bg-surface-100" };

        return (
          <Link
            key={key}
            href={`/explore?categoria=${key}`}
            className={`flex flex-col items-center gap-2 rounded-2xl ${colores.bg} ${colores.hover} p-4 min-w-[5.5rem] transition-all duration-200 cursor-pointer group`}
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colores.bg} ${colores.text} transition-transform duration-200 group-hover:scale-110`}>
              <Icono className="h-5 w-5" />
            </div>
            <span className={`text-xs font-medium ${colores.text} whitespace-nowrap`}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
