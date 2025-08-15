import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EventFilters {
  tipoEspacio: string;
  capacidad: number;
  tipoEvento: string;
  plan: string;
}

interface FiltrosStore {
  filters: EventFilters;
  setFilter: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: EventFilters = {
  tipoEspacio: '',
  capacidad: 50,
  tipoEvento: '',
  plan: ''
};

export const useFiltrosStore = create<FiltrosStore>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      setFilter: (key, value) => 
        set((state) => ({
          filters: { ...state.filters, [key]: value }
        })),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),
      resetFilters: () => set({ filters: defaultFilters })
    }),
    {
      name: 'event-filters-storage'
    }
  )
);