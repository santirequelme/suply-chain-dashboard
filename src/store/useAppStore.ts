import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Global search
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      globalSearch: "",
      setGlobalSearch: (q) => set({ globalSearch: q }),
    }),
    {
      name: "m2f-app-store",
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
);
