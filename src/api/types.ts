export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterestGroup {
  interest: string;
  userCount: number;
  users: { id: string; name: string; email: string }[];
}

export interface Pagination {
  currentPage: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: { field?: string; location?: string; message: string }[];
}
