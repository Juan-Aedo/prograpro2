"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LocationMode } from "@/lib/types";
import { SANTIAGO_CIUDAD, SANTIAGO_LAT, SANTIAGO_LNG } from "@/lib/constants";

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
      ciudad: SANTIAGO_CIUDAD,
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
          ciudad: SANTIAGO_CIUDAD,
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
