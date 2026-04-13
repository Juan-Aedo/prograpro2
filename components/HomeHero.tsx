"use client";

import { Search, Sun, CloudSun, Cloud, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeatherData } from "@/lib/types";

interface HomeHeroProps {
  clima: WeatherData;
}

const quickTags = [
  { label: "Hoy",         href: "/explore?q=hoy" },
  { label: "Gratis",      href: "/explore?q=gratis" },
  { label: "Cerca de mí", href: "/map" },
  { label: "Al aire libre", href: "/explore?categoria=aire-libre" },
];

export function HomeHero({ clima }: HomeHeroProps) {
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/explore?q=${encodeURIComponent(busqueda.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-cream-100 border-b border-ink-900/8">
      {/* Gradiente decorativo lateral — muy sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-teal-300/20 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full bg-cream-300/60 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 md:py-28 flex flex-col items-center text-center">

        {/* Clima pill — arriba del título */}
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-900/12 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm text-ink-600 mb-8 animate-fade-in">
          <Sun className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-ink-800">{clima.ciudad}</span>
          <span className="text-ink-300">·</span>
          <span>{clima.temperatura}°C · {clima.descripcion}</span>
          <MapPin className="h-3.5 w-3.5 text-ink-400" />
        </div>

        {/* Título principal — serif con split animation */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-ink-900 leading-tight tracking-tight text-balance mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          ¿Qué hacemos{" "}
          <span className="italic text-teal-500">hoy?</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-lg sm:text-xl text-ink-500 max-w-xl leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
          Descubre las mejores actividades de ocio en tu ciudad,
          según tus gustos y el clima del día.
        </p>

        {/* Barra de búsqueda — pill con borde y shadow offset */}
        <form
          onSubmit={handleBusqueda}
          className="w-full max-w-xl animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <div className="relative flex items-center rounded-full border border-ink-900 bg-white shadow-none transition-all duration-150 hover:shadow-offset focus-within:shadow-offset">
            <Search className="absolute left-5 h-5 w-5 text-ink-400 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar actividades, lugares, eventos..."
              className="w-full bg-transparent py-4 pl-14 pr-36 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none rounded-full"
            />
            <button
              type="submit"
              className="absolute right-2 rounded-full bg-teal-400 border border-ink-900/20 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-all duration-150 hover:bg-teal-500 cursor-pointer"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Quick tags */}
        <div className="mt-5 flex items-center flex-wrap justify-center gap-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <span className="text-xs text-ink-400 font-medium mr-1">Sugerencias:</span>
          {quickTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => router.push(tag.href)}
              className="rounded-full border border-ink-900/15 bg-cream-100 px-4 py-1.5 text-xs font-medium text-ink-600 transition-all duration-150 hover:border-ink-900/40 hover:shadow-offset-sm hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Stats / social proof */}
        <div className="mt-12 flex items-center gap-8 flex-wrap justify-center animate-fade-in" style={{ animationDelay: "500ms" }}>
          {[
            { valor: "3,200+", label: "actividades" },
            { valor: "15",     label: "categorías" },
            { valor: "40K",    label: "usuarios activos" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="font-display text-3xl font-bold text-ink-900">{stat.valor}</span>
              <span className="text-xs text-ink-400 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
