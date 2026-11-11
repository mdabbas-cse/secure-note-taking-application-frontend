import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { parseInterests } from '../api/endpoints';
import { useAuth } from '../auth/useAuth';
import { ErrorMessage } from '../components/ErrorMessage';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', interests: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({ ...form, interests: parseInterests(form.interests) });
      navigate('/notes', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={(event) => void onSubmit(event)}>
      <h1>Register</h1>
      <label>
        Name
        <input value={form.name} onChange={update('name')} required maxLength={100} />
      </label>
      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={update('email')}
          required
          autoComplete="email"
        />
      </label>
      <label>
        Password (min 8 characters)
        <input
          type="password"
          value={form.password}
          onChange={update('password')}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label>
        Interests (comma separated)
        <input value={form.interests} onChange={update('interests')} placeholder="chess, reading" />
      </label>
      <ErrorMessage message={error} />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Register'}
      </button>
      <p>
        Have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
