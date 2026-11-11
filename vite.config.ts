import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * Production builds must know where the API lives. Without this check a missing
 * VITE_API_BASE_URL would silently fall back to "/api" on the frontend's own
 * domain, where the SPA fallback answers every API call with index.html.
 */
function assertProductionApiUrl(value: string | undefined): void {
  const url = value?.trim();
  if (!url) {
    throw new Error(
      'VITE_API_BASE_URL is required for production builds, e.g. https://secure-notes-backend.vercel.app/api',
    );
  }
  const isRelative = url.startsWith('/');
  const isHttps = url.startsWith('https://');
  if (!isRelative && !isHttps) {
    throw new Error('VITE_API_BASE_URL must be an https:// URL (or a same-origin path like /api)');
  }
  if (/^https:\/\/(localhost|127\.0\.0\.1)/.test(url)) {
    throw new Error('VITE_API_BASE_URL must not point to localhost in a production build');
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (command === 'build' && mode === 'production') {
    assertProductionApiUrl(env.VITE_API_BASE_URL);
  }

  return {
    plugins: [react()],
    // Local development only: the dev server proxies /api to the local backend, so
    // the browser sees one origin. This target is never part of the production bundle.
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:4000',
          changeOrigin: false,
        },
      },
    },
  };
});
