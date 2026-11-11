import { useEffect, useState } from 'react';
import { errorMessage } from './client';

interface Result<T> {
  load?: () => Promise<T>;
  version: number;
  data?: T;
  error?: string;
}

/**
 * Minimal data-fetching hook. `load` must be memoised (useCallback) so a new
 * request is made only when its inputs change. Loading is derived (the last
 * result belongs to a different request), so no state is set synchronously.
 */
export function useRemote<T>(load: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T>>({ version: -1 });

  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setResult({ load, version, data }),
      (error: unknown) => active && setResult({ load, version, error: errorMessage(error) }),
    );
    return () => {
      active = false;
    };
  }, [load, version]);

  const loading = result.load !== load || result.version !== version;
  return {
    data: result.data,
    error: loading ? undefined : result.error,
    loading,
    reload: () => setVersion((value) => value + 1),
  };
}
