<script setup lang="ts">
import { useTables } from '../composables/useTables';
import { useFloorActivity } from '../composables/useFloorActivity';
import TableCard from '../components/TableCard.vue';
import { colors } from '@/shared/styles/colors';
import { TABLE_STATUS } from '@/shared/types';
import { TABLE_STATUS_LABEL } from '@/shared/constants/labels';
import { UI_LABELS } from '@/shared/constants/ui';
import { SERVICE_LABELS } from '../domain';

const { tables, loading, error, reload } = useTables();
const { activityByTable, reload: reloadActivity } = useFloorActivity();

function retry() {
  void reload();
  void reloadActivity();
}
</script>

<template>
  <div class="table-selection">
    <div class="legend" role="list" :aria-label="SERVICE_LABELS.tableSelection.legendAria">
      <div class="legend-item" role="listitem">
        <span class="legend-dot libre" aria-hidden="true" />
        <span>{{ TABLE_STATUS_LABEL[TABLE_STATUS.FREE].label }}</span>
      </div>
      <div class="legend-item" role="listitem">
        <span class="legend-dot ocupada" aria-hidden="true" />
        <span>{{ TABLE_STATUS_LABEL[TABLE_STATUS.OCCUPIED].label }}</span>
      </div>
      <div class="legend-item" role="listitem">
        <span class="legend-dot por_cobrar" aria-hidden="true" />
        <span>{{ TABLE_STATUS_LABEL[TABLE_STATUS.PENDING_PAYMENT].label }}</span>
      </div>
    </div>

    <p v-if="loading && tables.length === 0" class="state-msg">{{ UI_LABELS.loading }}</p>
    <div v-else-if="error" class="error-state">
      <p class="state-msg">{{ error }}</p>
      <button type="button" class="retry-btn" @click="retry">{{ UI_LABELS.retry }}</button>
    </div>
    <p v-else-if="tables.length === 0" class="state-msg">
      {{ SERVICE_LABELS.tableSelection.empty }}
    </p>

    <div v-else class="table-grid">
      <TableCard
        v-for="table in tables"
        :key="table.id"
        :table="table"
        :activity="activityByTable.get(table.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.table-selection {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.legend {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: v-bind('colors.neutral.secondary');
}

.legend-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.libre {
  background: v-bind('colors.table.free.bg');
}
.legend-dot.ocupada {
  background: v-bind('colors.table.occupied.bg');
}
.legend-dot.por_cobrar {
  background: v-bind('colors.table.pendingPayment.bg');
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 480px) {
  .table-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
}

.retry-btn {
  min-height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 10px;
  border: 1.5px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.retry-btn:active {
  background: v-bind('colors.brand.soft');
}

.state-msg {
  padding: 2rem 0;
  text-align: center;
  color: v-bind('colors.neutral.mutedText');
  font-size: 0.9rem;
}
</style>
