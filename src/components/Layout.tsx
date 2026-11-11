import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header>
        <strong>Secure Notes</strong>
        {user && (
          <nav>
            <NavLink to="/notes" end>
              Notes
            </NavLink>
            <NavLink to="/notes/new">New note</NavLink>
            {user.role === 'admin' && (
              <>
                <NavLink to="/admin/users">Users</NavLink>
                <NavLink to="/admin/interests">Interests</NavLink>
              </>
            )}
            <span className="muted">
              {user.name} ({user.role})
            </span>
            <button onClick={() => void handleLogout()}>Log out</button>
          </nav>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
