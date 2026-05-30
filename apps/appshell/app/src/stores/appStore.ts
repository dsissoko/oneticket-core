/**
 * AppStore — global Zustand store
 *
 * Manages client-side state that needs to be shared across components.
 * Theme is handled by next-themes — do not add theme state here.
 *
 * Convention:
 *   - Server state (API data) → React Query hooks in src/hooks/
 *   - Client state (UI, preferences) → this store
 *
 * Example — add a sidebar state:
 *
 *   import { create } from 'zustand'
 *
 *   interface AppStore {
 *     sidebarOpen: boolean
 *     setSidebarOpen: (open: boolean) => void
 *   }
 *
 *   export const useAppStore = create<AppStore>((set) => ({
 *     sidebarOpen: false,
 *     setSidebarOpen: (open) => set({ sidebarOpen: open }),
 *   }))
 */
