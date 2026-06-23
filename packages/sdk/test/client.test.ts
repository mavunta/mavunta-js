import { afterEach, describe, expect, it, vi } from 'vitest'
import { Coinwaka } from '../src/client.js'
import {
  CoinwakaAuthenticationError,
  CoinwakaPermissionError,
  CoinwakaRateLimitError,
  CoinwakaValidationError,
} from '../src/errors.js'

const KEY = 'cwk_test_sk_unit'

function mockResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  const normalized: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers)) normalized[k.toLowerCase()] = v
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k: string) => normalized[k.toLowerCase()] ?? null },
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response
}

function stubFetch(impl: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const fn = vi.fn(impl as never)
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Coinwaka client', () => {
  it('rejects a public key', () => {
    expect(() => new Coinwaka({ secretKey: 'cwk_test_pk_x' })).toThrow(/public key/i)
  })

  it('requires a secret key', () => {
    // @ts-expect-error intentionally missing
    expect(() => new Coinwaka({})).toThrow(/secretKey/)
  })

  it('POSTs a payment intent with auth, idempotency, and JSON body', async () => {
    const fetchMock = stubFetch(() => mockResponse(200, { id: 'pi_1', status: 'requires_payment' }))
    const coinwaka = new Coinwaka({ secretKey: KEY })

    const intent = await coinwaka.paymentIntents.create({ amount: '2500', currency: 'KES' })

    expect(intent).toMatchObject({ id: 'pi_1' })
    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit]
    expect(String(url)).toBe('https://api.coinwaka.com/v1/payment-intents')
    expect(init.method).toBe('POST')
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe(`Bearer ${KEY}`)
    expect(headers['Idempotency-Key']).toMatch(/^cwk_sdk_/)
    expect(headers['Coinwaka-Version']).toBeTruthy()
    expect(JSON.parse(init.body as string)).toEqual({ amount: '2500', currency: 'KES' })
  })

  it('honours an explicit idempotency key', async () => {
    const fetchMock = stubFetch(() => mockResponse(200, { id: 'pi_2' }))
    const coinwaka = new Coinwaka({ secretKey: KEY })
    await coinwaka.paymentIntents.create({ amount: '1', currency: 'KES' }, { idempotencyKey: 'order_1' })
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('order_1')
  })

  it('GET requests carry no idempotency key and pass query params', async () => {
    const fetchMock = stubFetch(() => mockResponse(200, { object: 'list', data: [], has_more: false }))
    const coinwaka = new Coinwaka({ secretKey: KEY })
    await coinwaka.paymentIntents.list({ limit: 5, status: 'paid' })
    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit]
    expect(init.method).toBe('GET')
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBeUndefined()
    expect(String(url)).toContain('limit=5')
    expect(String(url)).toContain('status=paid')
  })

  it('maps 401 to CoinwakaAuthenticationError', async () => {
    stubFetch(() => mockResponse(401, { error: { type: 'authentication_error', code: 'invalid_key', message: 'Bad key' } }))
    const coinwaka = new Coinwaka({ secretKey: KEY, maxRetries: 0 })
    await expect(coinwaka.balances.retrieve()).rejects.toBeInstanceOf(CoinwakaAuthenticationError)
  })

  it('maps 403 to CoinwakaPermissionError', async () => {
    stubFetch(() => mockResponse(403, { error: { code: 'insufficient_scope' } }))
    const coinwaka = new Coinwaka({ secretKey: KEY, maxRetries: 0 })
    await expect(coinwaka.balances.retrieve()).rejects.toBeInstanceOf(CoinwakaPermissionError)
  })

  it('maps 422 to CoinwakaValidationError and exposes param', async () => {
    stubFetch(() =>
      mockResponse(422, { error: { type: 'validation_error', code: 'invalid_phone_number', param: 'customer.phone' } }),
    )
    const coinwaka = new Coinwaka({ secretKey: KEY, maxRetries: 0 })
    await expect(coinwaka.paymentIntents.create({ amount: '1', currency: 'KES' })).rejects.toMatchObject({
      name: 'CoinwakaValidationError',
      param: 'customer.phone',
    })
  })

  it('maps 429 to CoinwakaRateLimitError with retryAfterMs', async () => {
    stubFetch(() => mockResponse(429, { error: { code: 'rate_limited' } }, { 'retry-after': '2' }))
    const coinwaka = new Coinwaka({ secretKey: KEY, maxRetries: 0 })
    const err = await coinwaka.balances.retrieve().catch((e) => e)
    expect(err).toBeInstanceOf(CoinwakaRateLimitError)
    expect((err as CoinwakaRateLimitError).retryAfterMs).toBe(2000)
  })

  it('retries a 500 then succeeds', async () => {
    let calls = 0
    stubFetch(() => {
      calls += 1
      return calls === 1 ? mockResponse(500, { error: { code: 'server_error' } }) : mockResponse(200, { id: 'pi_ok' })
    })
    const coinwaka = new Coinwaka({ secretKey: KEY, maxRetries: 2 })
    const intent = await coinwaka.paymentIntents.create({ amount: '1', currency: 'KES' })
    expect(intent).toMatchObject({ id: 'pi_ok' })
    expect(calls).toBe(2)
  })

  it('builds the right URL for a path param', async () => {
    const fetchMock = stubFetch(() => mockResponse(200, { id: 'cus_1', object: 'customer' }))
    const coinwaka = new Coinwaka({ secretKey: KEY })
    await coinwaka.customers.retrieve('cus_1')
    expect(String(fetchMock.mock.calls[0]![0])).toBe('https://api.coinwaka.com/v1/customers/cus_1')
  })
})
