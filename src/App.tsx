import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { GuestOnly, RequireAdmin, RequireAuth } from './components/guards';
import { Layout } from './components/Layout';
import { InterestsPage } from './pages/InterestsPage';
import { LoginPage } from './pages/LoginPage';
import { NoteFormPage } from './pages/NoteFormPage';
import { NotesPage } from './pages/NotesPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/notes/new" element={<NoteFormPage />} />
              <Route path="/notes/:id/edit" element={<NoteFormPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/interests" element={<InterestsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/notes" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
