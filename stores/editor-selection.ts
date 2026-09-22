"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_TRAY_ITEMS } from "@/constants/workspace";

interface EditorSelectionStore {
  selectedAssetId: string | null;
  trayAssetIds: string[];
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useEditorSelectionStore = create<EditorSelectionStore>()(
  persist(
    (set) => ({
      selectedAssetId: null,
      trayAssetIds: [],
      hasHydrated: false,
      setHasHydrated: (hasHydrated) =>
        set((state) =>
          state.hasHydrated === hasHydrated ? state : { hasHydrated },
        ),
    }),
    {
      name: "runeicons-editor-selection",
      version: 1,
      partialize: (state) => ({
        selectedAssetId: state.selectedAssetId,
        trayAssetIds: state.trayAssetIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function selectAssetInStore(assetId: string) {
  useEditorSelectionStore.setState((state) => ({
    selectedAssetId: assetId,
    trayAssetIds: state.trayAssetIds.includes(assetId)
      ? state.trayAssetIds
      : [assetId, ...state.trayAssetIds].slice(0, MAX_TRAY_ITEMS),
  }));
}

export function removeFromTrayInStore(
  assetId: string,
  fallbackAssetId: string | null,
) {
  useEditorSelectionStore.setState((state) => {
    const nextTray = state.trayAssetIds.filter((id) => id !== assetId);
    return {
      trayAssetIds: nextTray,
      selectedAssetId:
        state.selectedAssetId === assetId
          ? nextTray[0] ?? fallbackAssetId
          : state.selectedAssetId,
    };
  });
}

export function updateTrayInStore(
  assetId: string,
  currentTrayIds: string[],
) {
  useEditorSelectionStore.setState({
    selectedAssetId: assetId,
    trayAssetIds: currentTrayIds.includes(assetId)
      ? currentTrayIds
      : [assetId, ...currentTrayIds].slice(0, MAX_TRAY_ITEMS),
  });
}
