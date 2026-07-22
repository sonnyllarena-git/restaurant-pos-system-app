import { useEffect } from 'react';

export function useKeyboard(key, handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const listener = (e) => {
      if (e.key === key) handler(e);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [key, handler, active]);
}
