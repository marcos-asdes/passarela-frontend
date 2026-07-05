/// <reference types="vite/client" />

/** Env vars customizadas expostas em `import.meta.env` (além das nativas do Vite). */
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
