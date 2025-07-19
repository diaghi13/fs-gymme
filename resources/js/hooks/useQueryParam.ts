import { useCallback } from 'react';

export function useQueryParam(
  key: string,
  defaultValue: string
): [string, (value: string) => void];
export function useQueryParam(
  key: string,
  defaultValue?: undefined
): [string | undefined, (value: string) => void];
export function useQueryParam(
  key: string,
  defaultValue?: string
) {
  const getValue = () => {
    const value = new URLSearchParams(window.location.search).get(key);
    return value ?? defaultValue;
  };

  const setValue = useCallback((value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url.toString());
  }, [key]);

  return [getValue(), setValue] as const;
}
