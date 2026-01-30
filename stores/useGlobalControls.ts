import { create } from "zustand";

type GlobalControlsState = {
  /** When true, audio is not sent to the server (listening view only). */
  offlineMode: boolean;
  setOfflineMode: (value: boolean) => void;
};

export const useGlobalControls = create<GlobalControlsState>((set) => ({
  offlineMode: false,
  setOfflineMode: (value) => set({ offlineMode: value }),
}));
