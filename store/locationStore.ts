"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LocationMode } from "@/lib/types";

const SANTIAGO_LAT = -33.4489;
const SANTIAGO_LNG = -70.6693;

interface LocationState {
  lat: number;
  lng: number;
  ciudad: string;
  modo: LocationMode;
  setGps: (lat: number, lng: number, ciudad?: string) => void;
  setManual: (lat: number, lng: number, ciudad: string) => void;
  clearManual: () => void;
  setCiudad: (ciudad: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      lat: SANTIAGO_LAT,
      lng: SANTIAGO_LNG,
      ciudad: "Santiago Centro",
      modo: "default",

      setGps: (lat, lng, ciudad) => {
        if (get().modo === "manual") return;
        set({ lat, lng, ciudad: ciudad ?? "Tu ubicación", modo: "gps" });
      },

      setManual: (lat, lng, ciudad) => {
        set({ lat, lng, ciudad, modo: "manual" });
      },

      clearManual: () => {
        set({
          lat: SANTIAGO_LAT,
          lng: SANTIAGO_LNG,
          ciudad: "Santiago Centro",
          modo: "default",
        });
      },

      setCiudad: (ciudad) => set({ ciudad }),
    }),
    {
      name: "panoramas-location",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lat: state.lat,
        lng: state.lng,
        ciudad: state.ciudad,
        modo: state.modo,
      }),
    }
  )
);
