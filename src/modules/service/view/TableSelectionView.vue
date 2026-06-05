<script setup lang="ts">
import { computed } from 'vue'
import { useTables, type TableWithArea } from '../composables/useTables'
import TableCard from '../components/TableCard.vue'
import { colors } from '@/shared/styles/colors'

const { tables, loading, error } = useTables()

const tablesByArea = computed(() => {
  const map = new Map<string, TableWithArea[]>()
  for (const table of tables.value) {
    const area = table.areaName || 'Sin área'
    if (!map.has(area)) map.set(area, [])
    map.get(area)!.push(table)
  }
  return map
})
</script>

<template>
  <div class="table-selection">
    <div class="legend" role="list" aria-label="Estado de mesas">
      <div class="legend-item" role="listitem">
        <span class="legend-dot libre" aria-hidden="true" />
        <span>Libre</span>
      </div>
      <div class="legend-item" role="listitem">
        <span class="legend-dot ocupada" aria-hidden="true" />
        <span>Ocupada</span>
      </div>
      <div class="legend-item" role="listitem">
        <span class="legend-dot por_cobrar" aria-hidden="true" />
        <span>Por cobrar</span>
      </div>
    </div>

    <p v-if="loading" class="state-msg">Cargando…</p>
    <p v-else-if="error" class="state-msg">{{ error }}</p>
    <p v-else-if="tables.length === 0" class="state-msg">No hay mesas registradas.</p>

    <template v-else>
      <section
        v-for="[areaName, areaTables] in tablesByArea"
        :key="areaName"
        class="area-section"
      >
        <h2 v-if="tablesByArea.size > 1" class="area-heading">{{ areaName }}</h2>
        <div class="table-grid">
          <TableCard v-for="table in areaTables" :key="table.id" :table="table" />
        </div>
      </section>
    </template>
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

.legend-dot.libre      { background: v-bind('colors.table.free.bg'); }
.legend-dot.ocupada    { background: v-bind('colors.table.occupied.bg'); }
.legend-dot.por_cobrar { background: v-bind('colors.table.pendingPayment.bg'); }

.area-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.area-heading {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: v-bind('colors.neutral.muted');
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

.state-msg {
  padding: 2rem 0;
  text-align: center;
  color: v-bind('colors.neutral.muted');
  font-size: 0.9rem;
}
</style>
