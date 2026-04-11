import { create } from "zustand";
import type { ActivityCategory, FilterState } from "@/lib/types";

interface FiltersState extends FilterState {
  setBusqueda: (busqueda: string) => void;
  toggleCategoria: (categoria: ActivityCategory) => void;
  setCategorias: (categorias: ActivityCategory[]) => void;
  setPrecioMax: (precio: number) => void;
  toggleSoloDestacadas: () => void;
  setOrdenarPor: (orden: FilterState["ordenarPor"]) => void;
  resetFiltros: () => void;
}

const estadoInicial: FilterState = {
  busqueda: "",
  categorias: [],
  precioMax: 100000,
  soloDestacadas: false,
  ordenarPor: "relevancia",
};

export const useFiltersStore = create<FiltersState>((set) => ({
  ...estadoInicial,

  setBusqueda: (busqueda) => set({ busqueda }),

  toggleCategoria: (categoria) =>
    set((state) => ({
      categorias: state.categorias.includes(categoria)
        ? state.categorias.filter((c) => c !== categoria)
        : [...state.categorias, categoria],
    })),

  setCategorias: (categorias) => set({ categorias }),

  setPrecioMax: (precioMax) => set({ precioMax }),

  toggleSoloDestacadas: () =>
    set((state) => ({ soloDestacadas: !state.soloDestacadas })),

  setOrdenarPor: (ordenarPor) => set({ ordenarPor }),

  resetFiltros: () => set(estadoInicial),
}));
