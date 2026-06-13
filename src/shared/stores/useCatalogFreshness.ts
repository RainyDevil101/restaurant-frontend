import { onMounted, onBeforeUnmount } from 'vue';
import { getCatalogStamp, type ResourceStamp, type CatalogStampDto } from '@/shared/api/catalog';
import { DEFAULT_TTL_MS } from './createResourceStore';
import { useProductsStore, useCategoriesStore, useMenusStore } from './catalogStores';

type CatalogResourceKey = keyof CatalogStampDto;

interface FreshnessHandle {
  isStale: boolean;
  touch: () => void;
  ensureLoaded: () => Promise<void>;
  refresh: () => Promise<void>;
  invalidate: () => void;
}

function stampChanged(previous: ResourceStamp | undefined, next: ResourceStamp): boolean {
  if (!previous) return true;
  return previous.count !== next.count || previous.lastModified !== next.lastModified;
}

export function useCatalogFreshness(
  resources: CatalogResourceKey[] = ['products', 'categories', 'menus'],
) {
  const stores: Record<CatalogResourceKey, FreshnessHandle> = {
    products: useProductsStore(),
    categories: useCategoriesStore(),
    menus: useMenusStore(),
  };

  let cachedStamp: Partial<CatalogStampDto> = {};
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  async function loadAll(): Promise<void> {
    await Promise.all(resources.map((key) => stores[key].ensureLoaded()));
  }

  async function refreshStale(): Promise<void> {
    for (const key of resources) stores[key].touch();
    await Promise.all(
      resources.filter((key) => stores[key].isStale).map((key) => stores[key].refresh()),
    );
  }

  async function reconcileWithStamp(): Promise<void> {
    let stamp: CatalogStampDto;
    try {
      stamp = await getCatalogStamp();
    } catch {
      return;
    }
    const changed = resources.filter((key) => stampChanged(cachedStamp[key], stamp[key]));
    cachedStamp = stamp;
    await Promise.all(changed.map((key) => stores[key].refresh()));
  }

  function onFocus(): void {
    void refreshStale();
  }

  onMounted(() => {
    void loadAll();
    pollTimer = setInterval(() => {
      void reconcileWithStamp();
    }, DEFAULT_TTL_MS);
    window.addEventListener('focus', onFocus);
  });

  onBeforeUnmount(() => {
    if (pollTimer !== null) clearInterval(pollTimer);
    window.removeEventListener('focus', onFocus);
  });

  async function invalidateAndRefresh(...keys: CatalogResourceKey[]): Promise<void> {
    const targets = keys.length > 0 ? keys : resources;
    for (const key of targets) stores[key].invalidate();
    await Promise.all(targets.map((key) => stores[key].refresh()));
  }

  return { invalidateAndRefresh, reconcileWithStamp, loadAll, refreshStale };
}
