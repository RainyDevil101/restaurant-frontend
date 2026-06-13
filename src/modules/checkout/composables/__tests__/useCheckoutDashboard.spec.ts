import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { ORDER_STATUS } from '@/shared/types'
import type { ApiOrder } from '@/shared/api/orders'

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
}))

vi.mock('@/shared/api/orders', () => ({
  listOrders: vi.fn<typeof import('@/shared/api/orders').listOrders>(),
}))

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}))

// Fake socket: captures handlers registered via `.on` in a map we control,
// so the test can pull a handler and invoke it to simulate a server event.
const handlers = new Map<string, (payload: ApiOrder) => void>()
const fakeSocket = {
  emit: vi.fn<(event: string, ...args: unknown[]) => void>(),
  on: vi.fn<(event: string, handler: (payload: ApiOrder) => void) => void>((event, handler) => {
    handlers.set(event, handler)
  }),
  off: vi.fn<(event: string, handler?: (...args: unknown[]) => void) => void>(),
  disconnect: vi.fn<() => void>(),
}

vi.mock('@/shared/api/socket', () => ({
  connectOrdersSocket: vi.fn<typeof import('@/shared/api/socket').connectOrdersSocket>(
    () => fakeSocket as unknown as ReturnType<typeof import('@/shared/api/socket').connectOrdersSocket>,
  ),
}))

import { listTables } from '@/shared/api/venue'
import { listOrders } from '@/shared/api/orders'
import { toast } from '@/shared/toast'
import { useCheckoutDashboard } from '../useCheckoutDashboard'

const table1 = { id: 'table-1', name: 'Mesa 1', capacity: 4, status: 'ocupada' as const }
const table2 = { id: 'table-2', name: 'Mesa 2', capacity: 2, status: 'libre' as const }

function order(overrides: Partial<ApiOrder> = {}): ApiOrder {
  return {
    id: 'ord-1',
    tableId: 'table-1',
    createdBy: 'u1',
    createdAt: '2026-06-01T00:00:00Z',
    status: ORDER_STATUS.PENDING,
    paid: false,
    total: 180,
    items: [
      {
        itemId: 'i1',
        productId: 'p1',
        productName: 'Tacos',
        quantity: 2,
        unitPrice: 90,
        subtotal: 180,
      },
    ],
    ...overrides,
  }
}

async function withSetup(): Promise<ReturnType<typeof useCheckoutDashboard>> {
  let result!: ReturnType<typeof useCheckoutDashboard>
  mount(
    defineComponent({
      setup() {
        result = useCheckoutDashboard()
        return () => h('div')
      },
    }),
  )
  await flushPromises()
  return result
}

describe('useCheckoutDashboard — initial load', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    vi.mocked(listTables).mockResolvedValue([table1, table2])
    vi.mocked(listOrders).mockResolvedValue([order()])
  })

  it('populates active tables from tables that have billable orders', async () => {
    const { activeTables } = await withSetup()
    expect(activeTables.value).toHaveLength(1)
    expect(activeTables.value[0]?.table.id).toBe('table-1')
    expect(activeTables.value[0]?.total).toBe(180)
    expect(activeTables.value[0]?.hasNewOrder).toBe(true)
  })

  it('exposes loading false after load resolves', async () => {
    const { loading } = await withSetup()
    expect(loading.value).toBe(false)
  })

  it('joins the checkout room and subscribes to order events', async () => {
    await withSetup()
    expect(fakeSocket.emit).toHaveBeenCalledWith('joinCheckout')
    expect(handlers.has('orderCreated')).toBe(true)
    expect(handlers.has('orderStatusChanged')).toBe(true)
  })

  it('selectedSummary resolves once a table is selected', async () => {
    const { selectedTableId, selectedSummary } = await withSetup()
    expect(selectedSummary.value).toBeNull()
    selectedTableId.value = 'table-1'
    expect(selectedSummary.value?.table.id).toBe('table-1')
  })
})

describe('useCheckoutDashboard — bill aggregation', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    vi.mocked(listTables).mockResolvedValue([table1])
  })

  it('billLines aggregates the same product across multiple orders', async () => {
    vi.mocked(listOrders).mockResolvedValue([order({ id: 'ord-1' }), order({ id: 'ord-2' })])
    const { selectedTableId, billLines, billTotal } = await withSetup()
    selectedTableId.value = 'table-1'
    expect(billLines.value).toHaveLength(1)
    expect(billLines.value[0]?.quantity).toBe(4)
    expect(billLines.value[0]?.subtotal).toBe(360)
    expect(billTotal.value).toBe(360)
  })

  it('billLines is empty when no table is selected', async () => {
    vi.mocked(listOrders).mockResolvedValue([order()])
    const { billLines } = await withSetup()
    expect(billLines.value).toHaveLength(0)
  })

  it('excludes cancelled and paid orders from active tables', async () => {
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'ord-1', status: ORDER_STATUS.CANCELLED }),
      order({ id: 'ord-2', paid: true }),
    ])
    const { activeTables } = await withSetup()
    expect(activeTables.value).toHaveLength(0)
  })
})

describe('useCheckoutDashboard — realtime events (RF09)', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    vi.mocked(listTables).mockResolvedValue([table1])
    vi.mocked(listOrders).mockResolvedValue([])
  })

  it('orderCreated upserts a new order into the dashboard', async () => {
    const { activeTables } = await withSetup()
    expect(activeTables.value).toHaveLength(0)

    handlers.get('orderCreated')!(order({ id: 'ord-new' }))
    await flushPromises()

    expect(activeTables.value).toHaveLength(1)
    expect(activeTables.value[0]?.total).toBe(180)
    expect(toast.info).toHaveBeenCalledWith('Nuevo pedido · Mesa 1')
  })

  it('orderStatusChanged replaces an existing order in place', async () => {
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'ord-1', status: ORDER_STATUS.PENDING }),
    ])
    const { activeTables } = await withSetup()
    expect(activeTables.value[0]?.hasNewOrder).toBe(true)

    handlers.get('orderStatusChanged')!(order({ id: 'ord-1', status: ORDER_STATUS.DELIVERED }))
    await flushPromises()

    expect(activeTables.value).toHaveLength(1)
    expect(activeTables.value[0]?.hasNewOrder).toBe(false)
  })

  it('orderStatusChanged to cancelled removes the order from active tables', async () => {
    vi.mocked(listOrders).mockResolvedValue([order({ id: 'ord-1' })])
    const { activeTables } = await withSetup()
    expect(activeTables.value).toHaveLength(1)

    handlers.get('orderStatusChanged')!(order({ id: 'ord-1', status: ORDER_STATUS.CANCELLED }))
    await flushPromises()

    expect(activeTables.value).toHaveLength(0)
  })
})
