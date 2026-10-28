/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL pública do site, definida pelo workflow de deploy. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
