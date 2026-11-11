import { useSearchParams } from 'react-router-dom';

/** Current page lives in the URL (?page=), so it survives reloads and back/forward. */
export function usePageParam(): [number, (page: number) => void] {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const setPage = (next: number) =>
    setParams((current) => {
      const updated = new URLSearchParams(current);
      updated.set('page', String(next));
      return updated;
    });
  return [page, setPage];
}
