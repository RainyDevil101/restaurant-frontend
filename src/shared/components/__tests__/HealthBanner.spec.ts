import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HealthBanner from '../HealthBanner.vue'

function okResponse(ok: boolean): Response {
  return { ok } as Response
}

describe('HealthBanner', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('stays hidden when the health check responds ok', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse(true))
    const wrapper = mount(HealthBanner)
    await flushPromises()
    expect(wrapper.find('.health-banner').exists()).toBe(false)
  })

  it('shows the degraded banner when the health check responds not-ok', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse(false))
    const wrapper = mount(HealthBanner)
    await flushPromises()
    expect(wrapper.find('.health-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Servidor no disponible')
  })

  it('shows the degraded banner when the health check rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    const wrapper = mount(HealthBanner)
    await flushPromises()
    expect(wrapper.find('.health-banner').exists()).toBe(true)
  })

  it('queries the /health endpoint on mount', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse(true))
    mount(HealthBanner)
    await flushPromises()
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'))
  })

  it('exposes the degraded banner as a polite status region', async () => {
    vi.mocked(fetch).mockResolvedValue(okResponse(false))
    const wrapper = mount(HealthBanner)
    await flushPromises()
    const banner = wrapper.find('.health-banner')
    expect(banner.attributes('role')).toBe('status')
    expect(banner.attributes('aria-live')).toBe('polite')
  })

  it('re-checks on the poll interval and reflects a recovered server', async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockResolvedValue(okResponse(false))
    const wrapper = mount(HealthBanner)
    await flushPromises()
    expect(wrapper.find('.health-banner').exists()).toBe(true)

    vi.mocked(fetch).mockResolvedValue(okResponse(true))
    await vi.advanceTimersByTimeAsync(30_000)
    await flushPromises()
    expect(wrapper.find('.health-banner').exists()).toBe(false)
  })

  it('stops polling after unmount', async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockResolvedValue(okResponse(true))
    const wrapper = mount(HealthBanner)
    await flushPromises()
    const callsAtMount = vi.mocked(fetch).mock.calls.length

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(vi.mocked(fetch).mock.calls.length).toBe(callsAtMount)
  })
})
