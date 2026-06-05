/// <reference types="vite/client" />
/// <reference types="w3c-web-usb" />
/// <reference types="web-bluetooth" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
