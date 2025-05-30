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
      
      addItem: (item) => {
        const userEmail = localStorage.getItem('userEmail');
        const uid = localStorage.getItem('uid');
        if (!userEmail && !uid) {
          throw new Error('Debes iniciar sesión para añadir productos al carrito');
        }

        // Verificar si el usuario actual es el vendedor
        if (item.usuario_email === userEmail) {
          throw new Error('No puedes comprar tus propios productos');
        }

        set((state) => {
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
        });
      },
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),

      // Función para limpiar el carrito cuando el usuario cierra sesión
      clearCartOnLogout: () => {
        localStorage.removeItem('cart-storage');
        set({ items: [] });
      }
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage
    }
  )
);

export default useCartStore;