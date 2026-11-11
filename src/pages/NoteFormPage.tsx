import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { notesApi } from '../api/endpoints';
import type { Note } from '../api/types';
import { useRemote } from '../api/useRemote';
import { ErrorMessage } from '../components/ErrorMessage';

/** Create (/notes/new) and edit (/notes/:id/edit) share one form. */
export function NoteFormPage() {
  const { id } = useParams();
  const load = useCallback(() => (id ? notesApi.get(id) : Promise.resolve(null)), [id]);
  const { data: note, error, loading } = useRemote<Note | null>(load);

  if (loading) return <p>Loading…</p>;
  if (error) return <ErrorMessage message={error} />;
  // `key` remounts the form with fresh initial values when the note changes.
  return <NoteForm key={note?.id ?? 'new'} note={note ?? null} />;
}

function NoteForm({ note }: { note: Note | null }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (note) await notesApi.update(note.id, { title, content });
      else await notesApi.create({ title, content });
      navigate('/notes');
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form className="card wide" onSubmit={(event) => void onSubmit(event)}>
      <h1>{note ? 'Edit note' : 'New note'}</h1>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </label>
      <label>
        Content
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          maxLength={20000}
        />
      </label>
      <ErrorMessage message={error} />
      <div className="actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => navigate('/notes')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
