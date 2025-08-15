import React, { createContext, useContext, useState, useEffect } from 'react';

export interface EventFilters {
  tipoEspacio: string;
  capacidad: number;
  tipoEvento: string;
  plan: string;
}

interface FiltrosContextType {
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

const FiltrosContext = createContext<FiltrosContextType | undefined>(undefined);

export const FiltrosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFiltersState] = useState<EventFilters>(() => {
    const saved = localStorage.getItem('event-filters-storage');
    return saved ? JSON.parse(saved) : defaultFilters;
  });

  useEffect(() => {
    localStorage.setItem('event-filters-storage', JSON.stringify(filters));
  }, [filters]);

  const setFilter = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  };

  const setFilters = (newFilters: Partial<EventFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  return (
    <FiltrosContext.Provider value={{ filters, setFilter, setFilters, resetFilters }}>
      {children}
    </FiltrosContext.Provider>
  );
};

export const useFiltrosStore = () => {
  const context = useContext(FiltrosContext);
  if (context === undefined) {
    throw new Error('useFiltrosStore must be used within a FiltrosProvider');
  }
  return context;
};