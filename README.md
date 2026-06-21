# Subito — Frontend

Interfaz web de **Subito**, un sistema de gestión de pedidos para restaurantes (proyecto de título) que reemplaza la toma de pedidos en papel. Tiene tres modos según el rol:

- **Mesero:** toma pedidos desde el celular (vista móvil).
- **Cajero:** ve los pedidos en tiempo real, consolida la cuenta de cada mesa y cobra.
- **Administrador:** configura productos, categorías, menús, mesas, áreas, usuarios e impresoras.

Esta app es solo el cliente: consume la API y el canal en tiempo real del backend (`restaurant-backend`).

## Stack

Vue 3 (`<script setup>`) + TypeScript + Vite + Pinia + Vue Router. PWA instalable. Tiempo real con Socket.IO.

## Requisitos

- Node `^20.19.0 || >=22.12.0`
- pnpm
- El backend corriendo (por defecto en `http://localhost:3000`)

## Cómo iniciar

```bash
pnpm install
cp .env.example .env        # ajusta VITE_API_URL si tu backend no está en :3000
pnpm dev                    # servidor de desarrollo en http://localhost:5173
```

`VITE_API_URL` apunta a la API del backend (`<origin>/api`, por defecto `http://localhost:3000/api`). La URL del WebSocket se deriva sola de esa variable. Ojo: las variables `VITE_*` se hornean en el **build**, no se leen en runtime.

### Cuentas de prueba (las crea el seed del backend)

| Rol | Email | Credencial |
|---|---|---|
| Administrador | `admin@subito.cl` | `111111` |
| Cajero | `carlos@subito.cl` | `234567` |
| Mesero | `ana@subito.cl` | `123456` |

## Otros comandos

```bash
pnpm build          # type-check + build de producción
pnpm preview        # previsualiza el build en http://localhost:4173
pnpm test:unit      # tests unitarios (Vitest)
pnpm test:e2e       # tests end-to-end (Cypress) sobre el build
pnpm lint           # oxlint + eslint
```
