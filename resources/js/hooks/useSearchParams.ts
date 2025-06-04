export function useSearchParams (key: string | null = null) {
  const urlSearchParams = new URLSearchParams(window.location.search);

  return key ? urlSearchParams.get(key) : Object.fromEntries(urlSearchParams.entries());
}
