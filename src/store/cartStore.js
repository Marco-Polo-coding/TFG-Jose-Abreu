import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      loading: false,
      error: null,
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      addItem: (item) => set((state) => {
        // Verificar si el item ya existe en el carrito
        const existingItem = state.items.find(i => i.id === item.id);
        if (existingItem) {
          // Si existe, actualizar la cantidad
          return {
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        }
        // Si no existe, añadir nuevo item
        return {
          items: [...state.items, { ...item, quantity: 1 }]
        };
      }),
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      })),
      
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage
    }
  )
);

export default useCartStore;