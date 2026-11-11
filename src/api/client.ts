import axios, { AxiosError } from 'axios';
import type { ApiErrorBody, ApiSuccess, Paginated } from './types';

/**
 * Where the API lives. Production builds require VITE_API_BASE_URL (checked in
 * vite.config.ts); local development uses the Vite proxy at /api.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL?.trim() || '/api').replace(
  /\/+$/,
  '',
);

/**
 * Auth is an HttpOnly cookie set by the API: JavaScript never sees or stores the
 * token (nothing in localStorage). `withCredentials` makes the browser send it,
 * including cross-origin to the API's own domain.
 *
 * `X-Requested-With` is the API's CSRF check: a cookie-authenticated write must
 * carry it, and other sites cannot add it without a CORS preflight the API rejects.
 */
export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

let onUnauthorized: (() => void) | undefined;

/** AuthProvider registers a handler so an expired session logs the user out. */
export function setUnauthorizedHandler(handler: (() => void) | undefined): void {
  onUnauthorized = handler;
}

http.interceptors.response.use(undefined, (error: unknown) => {
  if (error instanceof AxiosError && error.response?.status === 401) {
    const url = error.config?.url ?? '';
    if (!url.startsWith('/auth/')) onUnauthorized?.();
  }
  return Promise.reject(error);
});

export function errorMessage(error: unknown): string {
  if (error instanceof AxiosError && !error.response) {
    // No HTTP response at all: offline, timeout, DNS, or a CORS rejection.
    return error.code === AxiosError.ECONNABORTED
      ? 'The server took too long to respond. Please try again.'
      : 'Cannot reach the server. Check your connection and try again.';
  }
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) {
      const details = body.errors
        .map((detail) => (detail.field ? `${detail.field}: ${detail.message}` : detail.message))
        .join('; ');
      return details ? `${body.message} (${details})` : body.message;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'Unexpected error';
}

export async function getData<T>(url: string, params?: object): Promise<T> {
  const res = await http.get<ApiSuccess<T>>(url, { params });
  return res.data.data;
}

export async function getPage<T>(url: string, params?: object): Promise<Paginated<T>> {
  const res = await http.get<ApiSuccess<T[]>>(url, { params });
  return { data: res.data.data, pagination: res.data.pagination! };
}
