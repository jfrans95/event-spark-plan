import { create } from 'zustand';

interface UIState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  selectedItems: string[];
  toggleItem: (id: string) => void;
  clearSelection: () => void;
  
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  selectedItems: [],
  toggleItem: (id) => set((state) => ({
    selectedItems: state.selectedItems.includes(id)
      ? state.selectedItems.filter(item => item !== id)
      : [...state.selectedItems, id]
  })),
  clearSelection: () => set({ selectedItems: [] }),
  
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}));