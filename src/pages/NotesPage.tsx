import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { notesApi } from '../api/endpoints';
import { useRemote } from '../api/useRemote';
import { useAuth } from '../auth/useAuth';
import { ErrorMessage } from '../components/ErrorMessage';
import { PaginationControls } from '../components/PaginationControls';
import { usePageParam } from '../components/usePageParam';

const LIMIT = 10;

export function NotesPage() {
  const { user } = useAuth();
  const [page, setPage] = usePageParam();
  const load = useCallback(() => notesApi.list({ page, limit: LIMIT }), [page]);
  const { data, error, loading, reload } = useRemote(load);
  const [actionError, setActionError] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  const remove = async (id: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesApi.remove(id);
      setActionError(null);
      // Step back if the last note on this page was removed.
      if (data?.data.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  return (
    <section>
      <h1>{isAdmin ? 'All notes' : 'My notes'}</h1>
      {loading && <p>Loading…</p>}
      <ErrorMessage message={error ?? actionError} />
      {data && data.data.length === 0 && !loading && (
        <p>
          No notes yet. <Link to="/notes/new">Create one</Link>.
        </p>
      )}
      {data && data.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Content</th>
              {isAdmin && <th>Owner id</th>}
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.data.map((note) => {
              const own = note.user === user?.id;
              return (
                <tr key={note.id}>
                  <td>{note.title}</td>
                  <td className="content">{note.content}</td>
                  {isAdmin && <td className="muted">{own ? 'me' : note.user}</td>}
                  <td>{new Date(note.createdAt).toLocaleString()}</td>
                  <td className="actions">
                    {/* Writes are owner-only on the API, admins included. */}
                    {own && (
                      <>
                        <Link to={`/notes/${note.id}/edit`}>Edit</Link>
                        <button onClick={() => void remove(note.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <PaginationControls pagination={data?.pagination} onPageChange={setPage} />
    </section>
  );
}
