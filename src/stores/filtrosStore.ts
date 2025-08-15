import React, { createContext, useContext, useState, useEffect } from 'react';

export interface EventFilters {
  tipoEspacio: string;
  capacidad: number;
  tipoEvento: string;
  plan: string;
}

interface FiltrosContextType {
  filters: EventFilters;
  setFilter: (key: keyof EventFilters, value: any) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: EventFilters = {
  tipoEspacio: '',
  capacidad: 50,
  tipoEvento: '',
  plan: ''
};

const FiltrosContext = createContext<FiltrosContextType | undefined>(undefined);

export function FiltrosProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<EventFilters>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('event-filters-storage');
      return saved ? JSON.parse(saved) : defaultFilters;
    }
    return defaultFilters;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('event-filters-storage', JSON.stringify(filters));
    }
  }, [filters]);

  const setFilter = (key: keyof EventFilters, value: any) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  };

  const setFilters = (newFilters: Partial<EventFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  return React.createElement(
    FiltrosContext.Provider,
    { value: { filters, setFilter, setFilters, resetFilters } },
    children
  );
}

export const useFiltrosStore = () => {
  const context = useContext(FiltrosContext);
  if (context === undefined) {
    throw new Error('useFiltrosStore must be used within a FiltrosProvider');
  }
  return context;
};