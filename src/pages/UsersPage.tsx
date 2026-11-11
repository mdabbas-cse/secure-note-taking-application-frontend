import { useCallback, useState, type FormEvent } from 'react';
import { errorMessage } from '../api/client';
import { parseInterests, usersApi } from '../api/endpoints';
import type { Role, User } from '../api/types';
import { useRemote } from '../api/useRemote';
import { useAuth } from '../auth/useAuth';
import { ErrorMessage } from '../components/ErrorMessage';
import { PaginationControls } from '../components/PaginationControls';
import { usePageParam } from '../components/usePageParam';

const LIMIT = 10;
const emptyForm = { name: '', email: '', password: '', role: 'user' as Role, interests: '' };

export function UsersPage() {
  const { user: me } = useAuth();
  const [page, setPage] = usePageParam();
  const load = useCallback(() => usersApi.list({ page, limit: LIMIT }), [page]);
  const { data, error, loading, reload } = useRemote(load);
  const [form, setForm] = useState(emptyForm);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      setActionError(null);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  const onCreate = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await usersApi.create({ ...form, interests: parseInterests(form.interests) });
      setForm(emptyForm);
    });
  };

  const changeRole = (user: User, role: Role) => void run(() => usersApi.update(user.id, { role }));

  const remove = (user: User) => {
    if (!window.confirm(`Delete ${user.email} and all of their notes and posts?`)) return;
    void run(() => usersApi.remove(user.id));
  };

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [name]: event.target.value })),
  });

  return (
    <section>
      <h1>User management</h1>

      <form className="inline-form" onSubmit={onCreate}>
        <input placeholder="Name" required {...field('name')} />
        <input placeholder="Email" type="email" required {...field('email')} />
        <input
          placeholder="Password"
          type="password"
          required
          minLength={8}
          {...field('password')}
        />
        <select {...field('role')}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <input placeholder="Interests (comma separated)" {...field('interests')} />
        <button type="submit">Create user</button>
      </form>

      {loading && <p>Loading…</p>}
      <ErrorMessage message={error ?? actionError} />

      {data && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Interests</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.data.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.name}
                  {user.id === me?.id && <span className="muted"> (you)</span>}
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user, e.target.value as Role)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{user.interests.join(', ')}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => remove(user)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <PaginationControls pagination={data?.pagination} onPageChange={setPage} />
    </section>
  );
}
