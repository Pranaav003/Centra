/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_STRIPE_PRICE_MONTHLY?: string
  readonly VITE_STRIPE_PRICE_ANNUAL?: string
  readonly VITE_STRIPE_PRICE_LIFETIME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


