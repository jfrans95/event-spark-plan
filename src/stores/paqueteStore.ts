import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PaqueteItem {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  cantidad: number;
}

interface PaqueteStore {
  items: PaqueteItem[];
  addItem: (item: Omit<PaqueteItem, 'cantidad'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearPackage: () => void;
  getTotal: () => number;
}

export const usePaqueteStore = create<PaqueteStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => 
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map(i => 
                i.id === item.id 
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              )
            };
          }
          return {
            items: [...state.items, { ...item, cantidad: 1 }]
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        })),
      updateQuantity: (id, cantidad) =>
        set((state) => ({
          items: cantidad === 0 
            ? state.items.filter(item => item.id !== id)
            : state.items.map(item => 
                item.id === id ? { ...item, cantidad } : item
              )
        })),
      clearPackage: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
      }
    }),
    {
      name: 'event-package-storage'
    }
  )
);