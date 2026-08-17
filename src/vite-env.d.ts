/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_PROVIDER?: 'memory' | 'api' | string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string
  readonly DATA_PROVIDER?: 'memory' | 'api' | string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
