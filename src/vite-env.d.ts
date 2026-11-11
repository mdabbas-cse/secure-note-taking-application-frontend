/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL, e.g. https://secure-notes-backend.vercel.app/api. Defaults to /api in development. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
