import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PaqueteItem {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  cantidad: number;
}

interface PaqueteContextType {
  items: PaqueteItem[];
  addItem: (item: Omit<PaqueteItem, 'cantidad'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearPackage: () => void;
  getTotal: () => number;
}

const PaqueteContext = createContext<PaqueteContextType | undefined>(undefined);

export function PaqueteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PaqueteItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('event-package-storage');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('event-package-storage', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (item: Omit<PaqueteItem, 'cantidad'>) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, cantidad: number) => {
    setItems(prev => 
      cantidad === 0 
        ? prev.filter(item => item.id !== id)
        : prev.map(item => 
            item.id === id ? { ...item, cantidad } : item
          )
    );
  };

  const clearPackage = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const contextValue = {
    items, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearPackage, 
    getTotal 
  };

  return React.createElement(
    PaqueteContext.Provider,
    { value: contextValue },
    children
  );
}

export const usePaqueteStore = () => {
  const context = useContext(PaqueteContext);
  if (context === undefined) {
    throw new Error('usePaqueteStore must be used within a PaqueteProvider');
  }
  return context;
};