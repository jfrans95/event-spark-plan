import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Category =
  | "Montaje técnico"
  | "Decoración/ambientación"
  | "Catering"
  | "Mixología/coctelería"
  | "Arte/cultura"
  | "Audiovisuales"
  | "Mobiliario";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // COP
  category: Category;
  images?: string[];
  // Database fields for filtering
  space_types?: string[];
  capacity_min?: number;
  capacity_max?: number;
  event_types?: string[];
  plan?: string;
  activo?: boolean;
}

export interface PackageItem {
  product: Product;
  quantity: number; // Changed from qty to quantity
}

interface PackageContextValue {
  items: PackageItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;
  total: number;
  groupedByCategory: Record<Category, PackageItem[]>;
}

const PackageContext = createContext<PackageContextValue | undefined>(undefined);

const STORAGE_KEY = "package_v1";

export const PackageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<PackageItem[]>([]);

  // load from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // persist to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], quantity: clone[idx].quantity + 1 };
        return clone;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  };

  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);

  const groupedByCategory = useMemo(() => {
    const groups = {
      "Montaje técnico": [],
      "Decoración/ambientación": [],
      "Catering": [],
      "Mixología/coctelería": [],
      "Arte/cultura": [],
      "Audiovisuales": [],
      "Mobiliario": [],
    } as Record<Category, PackageItem[]>;
    for (const item of items) {
      (groups[item.product.category] as PackageItem[]).push(item);
    }
    return groups;
  }, [items]);

  const value: PackageContextValue = {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    total,
    groupedByCategory,
  };

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
};

export const usePackage = () => {
  const ctx = useContext(PackageContext);
  if (!ctx) throw new Error("usePackage debe usarse dentro de PackageProvider");
  return ctx;
};
