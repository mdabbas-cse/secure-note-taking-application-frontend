import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p>Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/**
 * UX only: hides admin screens from normal users. The API enforces the same rule
 * independently (authorize('admin')), so bypassing this changes nothing.
 */
export function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <p className="error">Admins only.</p>;
  return <Outlet />;
}

export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  if (user) return <Navigate to="/notes" replace />;
  return <Outlet />;
}
