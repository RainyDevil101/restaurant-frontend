<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Route } from '@/shared/types';
import BrandLogo from '@/shared/components/BrandLogo.vue';

const router = useRouter();
const auth = useAuthStore();

function logout() {
  auth.logout();
  router.push(Route.LOGIN);
}

const navItems = [
  { label: 'Productos', to: Route.ADMIN_PRODUCTS },
  { label: 'Categorías', to: Route.ADMIN_CATEGORIES },
  { label: 'Menús', to: Route.ADMIN_MENUS },
  { label: 'Áreas', to: Route.ADMIN_AREAS },
  { label: 'Mesas', to: Route.ADMIN_TABLES },
  { label: 'Usuarios', to: Route.ADMIN_USERS },
  { label: 'Pagos', to: Route.ADMIN_PAYMENTS },
  { label: 'Configuraciones', to: Route.ADMIN_SETTINGS },
  { label: 'Manual', to: Route.MANUAL },
];
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <BrandLogo size="1.375rem" />
      </div>

      <nav class="nav" aria-label="Administración">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          exact-active-class="nav-item--active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <button class="mode-btn" @click="router.push(Route.SERVICE)">Tomar pedido</button>
        <button class="mode-btn" @click="router.push(Route.CHECKOUT)">Ir a caja</button>
        <div class="user-row">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <span>{{ auth.user?.name }}</span>
        </div>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </div>
    </aside>

    <!-- Content area -->
    <main id="main" tabindex="-1" class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  height: 100dvh;
  display: flex;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #f8f9fa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.brand {
  padding: 1.25rem 1.25rem 1rem;
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0.5rem;
}

.nav-item {
  display: block;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.925rem;
  font-weight: 500;
  color: #374151;
  transition:
    background 0.12s,
    color 0.12s;
}

.nav-item:hover {
  background: #eef0f2;
}

.nav-item--active {
  background: #e8f5f3;
  color: var(--color-primary);
  font-weight: 600;
}

/* Sidebar bottom */
.sidebar-bottom {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-btn {
  width: 100%;
  padding: 10px;
  min-height: 2.75rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: background 0.12s;
  text-align: center;
}

.mode-btn:hover {
  background: #f3f4f6;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  min-height: 2.75rem;
  background: white;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #dc2626;
  transition: background 0.12s;
  text-align: center;
}

.logout-btn:hover {
  background: #fef2f2;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  background: white;
}
</style>
