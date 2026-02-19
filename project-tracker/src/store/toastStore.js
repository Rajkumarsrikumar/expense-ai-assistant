import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],

  add: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  success: (message) => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type: 'success' }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },

  error: (message) => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type: 'error' }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 5000);
  },
}));
