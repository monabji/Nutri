import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchProduct, ProductDataError, ProductNotFoundError } from './openFoodFacts'

const barcode = '8906009532363'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Open Food Facts client', () => {
  it('returns the two hackathon demo records without depending on a live response', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchProduct('8901719117183')).resolves.toMatchObject({ name: expect.stringContaining('Hide & Seek'), barcode: '8901719117183' })
    await expect(fetchProduct('8901491100267')).resolves.toMatchObject({ name: expect.stringContaining('Lay'), barcode: '8901491100267' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses a GET request with the documented barcode endpoint and limited fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 1, product: { code: barcode, product_name: 'Bar' } })))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchProduct(barcode)).resolves.toMatchObject({ name: 'Bar', barcode })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain(`/api/v2/product/${barcode}.json?fields=`)
    expect(url).toContain('ingredients_text')
    expect(options.method).toBe('GET')
  })

  it('refuses malformed barcode arguments before making a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchProduct('not-a-barcode')).rejects.toThrow('Enter an 8–14 digit product barcode.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps an absent record to an explicit not-found result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 0 }), { status: 200 })))
    await expect(fetchProduct(barcode)).rejects.toBeInstanceOf(ProductNotFoundError)
  })

  it('rejects malformed successful payloads instead of inventing facts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 1 }), { status: 200 })))
    await expect(fetchProduct(barcode)).rejects.toBeInstanceOf(ProductDataError)
  })

  it('surfaces a timed-out lookup as a retryable data error', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    const request = fetchProduct(barcode)
    const expectedTimeout = expect(request).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(8_000)
    await expectedTimeout
  })
})
