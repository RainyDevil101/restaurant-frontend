import { onMounted, onBeforeUnmount } from 'vue';

export interface TtlFreshnessHandle {
  isStale: boolean;
  touch: () => void;
  ensureLoaded: () => Promise<void>;
  refresh: () => Promise<void>;
  invalidate: () => void;
}

export function useTtlFreshness(stores: TtlFreshnessHandle[]) {
  async function loadAll(): Promise<void> {
    await Promise.all(stores.map((store) => store.ensureLoaded()));
  }

  async function refreshStale(): Promise<void> {
    for (const store of stores) store.touch();
    await Promise.all(stores.filter((store) => store.isStale).map((store) => store.refresh()));
  }

  function onFocus(): void {
    void refreshStale();
  }

  onMounted(() => {
    void loadAll();
    window.addEventListener('focus', onFocus);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('focus', onFocus);
  });

  async function invalidateAndRefresh(...targets: TtlFreshnessHandle[]): Promise<void> {
    const selected = targets.length > 0 ? targets : stores;
    for (const store of selected) store.invalidate();
    await Promise.all(selected.map((store) => store.refresh()));
  }

  return { invalidateAndRefresh, loadAll, refreshStale };
}
