import { useState, useCallback } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...options, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    
    // For now, just console.log the toast
    console.log('Toast:', options.title, options.description);
  }, []);

  return { toast, toasts };
}