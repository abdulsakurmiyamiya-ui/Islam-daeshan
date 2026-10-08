type ToastListener = (message: string, type?: 'info' | 'success' | 'warning') => void;

const listeners: Set<ToastListener> = new Set();

export function subscribeToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showToast(message: string, type: 'info' | 'success' | 'warning' = 'info') {
  listeners.forEach((listener) => {
    try {
      listener(message, type);
    } catch (e) {
      console.warn('Toast listener error:', e);
    }
  });
}
