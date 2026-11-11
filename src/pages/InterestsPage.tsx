import { useCallback, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usersApi } from '../api/endpoints';
import { useRemote } from '../api/useRemote';
import { ErrorMessage } from '../components/ErrorMessage';
import { PaginationControls } from '../components/PaginationControls';
import { usePageParam } from '../components/usePageParam';

const LIMIT = 10;

export function InterestsPage() {
  const [page, setPage] = usePageParam();
  const [params, setParams] = useSearchParams();
  const filter = params.get('interests') ?? '';
  const [draft, setDraft] = useState(filter);

  const load = useCallback(
    () => usersApi.interests({ page, limit: LIMIT, ...(filter && { interests: filter }) }),
    [page, filter],
  );
  const { data, error, loading } = useRemote(load);

  const applyFilter = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draft.trim()) next.set('interests', draft.trim());
    setParams(next); // resets to page 1
  };

  return (
    <section>
      <h1>Users grouped by interest</h1>
      <form className="inline-form" onSubmit={applyFilter}>
        <input
          placeholder="Filter: chess, reading"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit">Apply</button>
      </form>

      {loading && <p>Loading…</p>}
      <ErrorMessage message={error} />
      {data && data.data.length === 0 && !loading && <p>No interests found.</p>}
      {data && data.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Interest</th>
              <th>Users</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((group) => (
              <tr key={group.interest}>
                <td>{group.interest}</td>
                <td>{group.userCount}</td>
                <td>{group.users.map((user) => user.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <PaginationControls pagination={data?.pagination} onPageChange={setPage} />
    </section>
  );
}
