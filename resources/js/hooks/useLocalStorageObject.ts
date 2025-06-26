import { useState } from 'react';

export function useLocalStorageObject<T extends Record<string, unknown>>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) as T : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // opzionale: gestisci l’errore
    }
  };

  const getAttribute = <K extends keyof T>(attr: K): T[K] | undefined => {
    return storedValue[attr];
  };

  const setAttribute = <K extends keyof T>(attr: K, value: T[K]) => {
    const newValue = { ...storedValue, [attr]: value };
    setStoredValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [storedValue, setValue, getAttribute, setAttribute] as const;
}
