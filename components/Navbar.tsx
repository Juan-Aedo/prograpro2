"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Home,
  Map,
  Search,
  CalendarCheck,
  Menu,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";

const enlaces = [
  { href: "/", label: "Inicio", icono: Home },
  { href: "/explore", label: "Explorar", icono: Search },
  { href: "/map", label: "Mapa", icono: Map },
  { href: "/bookings", label: "Reservas", icono: CalendarCheck },
];

export function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();
  const { estaAutenticado, usuario } = useUserStore();

  return (
    <>
      {/* Navbar desktop */}
      <nav className="sticky top-0 z-50 border-b border-surface-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 transition-transform duration-200 group-hover:scale-105">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900 tracking-tight">
              Panoramas
            </span>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-1">
            {enlaces.map(({ href, label, icono: Icono }) => {
              const activo = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                    activo
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-500 hover:bg-surface-100 hover:text-surface-900"
                  )}
                >
                  <Icono className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Acciones */}
          <div className="hidden md:flex items-center gap-3">
            {estaAutenticado && usuario ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 cursor-pointer transition-colors duration-200 hover:bg-brand-200">
                {usuario.avatar}
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-surface-500 transition-colors duration-200 hover:bg-surface-100 cursor-pointer"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          >
            {menuAbierto ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            menuAbierto ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-surface-100 bg-white px-4 pb-4 pt-2 space-y-1">
            {enlaces.map(({ href, label, icono: Icono }) => {
              const activo = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAbierto(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer",
                    activo
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-600 hover:bg-surface-50"
                  )}
                >
                  <Icono className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
            {!estaAutenticado && (
              <Link
                href="/login"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-all duration-200 cursor-pointer"
              >
                <User className="h-5 w-5" />
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Barra de navegación inferior móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-surface-200/60 bg-white/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {enlaces.map(({ href, label, icono: Icono }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer",
                  activo
                    ? "text-brand-600"
                    : "text-surface-400 hover:text-surface-600"
                )}
              >
                <Icono
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    activo && "scale-110"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
