import { getData, getPage, http } from './client';
import type { ApiSuccess, InterestGroup, Note, Role, User } from './types';

export interface PageQuery {
  page: number;
  limit: number;
}

export const authApi = {
  me: () => getData<{ user: User }>('/auth/me').then((data) => data.user),
  login: (email: string, password: string) =>
    http
      .post<ApiSuccess<{ user: User }>>('/auth/login', { email, password })
      .then((res) => res.data.data.user),
  register: (input: { name: string; email: string; password: string; interests: string[] }) =>
    http
      .post<ApiSuccess<{ user: User }>>('/auth/register', input)
      .then((res) => res.data.data.user),
  logout: () => http.post('/auth/logout'),
};

export const notesApi = {
  list: (query: PageQuery) => getPage<Note>('/notes', query),
  get: (id: string) => getData<Note>(`/notes/${id}`),
  create: (input: { title: string; content: string }) => http.post('/notes', input),
  update: (id: string, input: { title: string; content: string }) =>
    http.patch(`/notes/${id}`, input),
  remove: (id: string) => http.delete(`/notes/${id}`),
};

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  interests: string[];
}

export const usersApi = {
  list: (query: PageQuery) => getPage<User>('/users', query),
  create: (input: UserInput) => http.post('/users', input),
  update: (id: string, input: Partial<UserInput>) => http.patch(`/users/${id}`, input),
  remove: (id: string) => http.delete(`/users/${id}`),
  interests: (query: PageQuery & { interests?: string }) =>
    getPage<InterestGroup>('/users/aggregation/interests', query),
};

export const parseInterests = (csv: string): string[] =>
  csv
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
