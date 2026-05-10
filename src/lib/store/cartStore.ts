import { create } from 'zustand';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Just local storage for now, but instructions mentioned syncing with Firestore /cart/{userId}/items
// We will set up the local state, and then sync in a hook
export const useCartStore = create<CartState>((set) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.productId === item.productId);
    let newItems;
    if (existing) {
      newItems = state.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i);
    } else {
      newItems = [...state.items, item];
    }
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  removeItem: (productId) => set((state) => {
    const newItems = state.items.filter(i => i.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  updateQuantity: (productId, quantity) => set((state) => {
    const newItems = state.items.map(i => i.productId === productId ? { ...i, quantity } : i);
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  clearCart: () => {
    localStorage.setItem('cart', '[]');
    set({ items: [] });
  }
}));
