import { create } from "zustand";
import type { Categoria } from "@/lib/types";

interface FiltrosStore {
  // Filtros activos
  query: string;
  categorias: Categoria[];
  presupuestoMax: number | null;
  soloGratis: boolean;
  soloTendencia: boolean;
  ordenar: "relevancia" | "precio-asc" | "precio-desc" | "rating";

  // Acciones
  setQuery: (q: string) => void;
  toggleCategoria: (cat: Categoria) => void;
  setPresupuestoMax: (val: number | null) => void;
  toggleSoloGratis: () => void;
  toggleSoloTendencia: () => void;
  setOrdenar: (orden: FiltrosStore["ordenar"]) => void;
  resetFiltros: () => void;
}

const ESTADO_INICIAL = {
  query: "",
  categorias: [] as Categoria[],
  presupuestoMax: null,
  soloGratis: false,
  soloTendencia: false,
  ordenar: "relevancia" as const,
};

export const useFiltrosStore = create<FiltrosStore>((set) => ({
  ...ESTADO_INICIAL,

  setQuery: (query) => set({ query }),

  toggleCategoria: (cat) =>
    set((state) => ({
      categorias: state.categorias.includes(cat)
        ? state.categorias.filter((c) => c !== cat)
        : [...state.categorias, cat],
    })),

  setPresupuestoMax: (presupuestoMax) => set({ presupuestoMax }),

  toggleSoloGratis: () =>
    set((state) => ({ soloGratis: !state.soloGratis })),

  toggleSoloTendencia: () =>
    set((state) => ({ soloTendencia: !state.soloTendencia })),

  setOrdenar: (ordenar) => set({ ordenar }),

  resetFiltros: () => set(ESTADO_INICIAL),
}));
