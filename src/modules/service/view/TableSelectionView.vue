<script setup lang="ts">
import { useTables } from '../composables/useTables'
import TableCard from '../components/TableCard.vue'

const { tables, loading, error } = useTables()
</script>

<template>
  <div class="table-selection">
    <h1 class="page-title">Mesas</h1>

    <div class="legend" role="list" aria-label="Estado de mesas">
      <div class="legend-item" role="listitem">
        <span class="legend-dot ocupada" aria-hidden="true" />
        <span>Ocupada</span>
      </div>
      <div class="legend-item" role="listitem">
        <span class="legend-dot por_cobrar" aria-hidden="true" />
        <span>Por cobrar</span>
      </div>
      <div class="legend-item" role="listitem">
        <span class="legend-dot libre" aria-hidden="true" />
        <span>Libre</span>
      </div>
    </div>

    <p v-if="loading" class="state-msg">Cargando…</p>
    <p v-else-if="error" class="state-msg">{{ error }}</p>
    <p v-else-if="tables.length === 0" class="state-msg">No hay mesas registradas.</p>
    <div v-else class="table-grid">
      <TableCard v-for="table in tables" :key="table.id" :table="table" />
    </div>
  </div>
</template>

<style scoped>
.table-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1a1a1a;
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
  font-size: 0.9rem;
  color: #555;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.libre      { background: #DCFCE7; }
.legend-dot.ocupada    { background: #DBEAFE; }
.legend-dot.por_cobrar { background: #FEF3C7; }

.table-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.state-msg {
  padding: 2rem 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
}
</style>
