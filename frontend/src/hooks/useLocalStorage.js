import { useState, useEffect } from 'react';
import { get, set } from '../services/storageService';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => get(key, initialValue));

  useEffect(() => {
    set(key, value);
  }, [key, value]);

  return [value, setValue];
}
