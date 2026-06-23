import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadCoinwaka } from '../src/load-coinwaka.js'
import { CoinwakaCheckout } from '../src/checkout.js'
import { CoinwakaCheckoutError } from '../src/errors.js'

const PK = 'cwk_test_pk_unit'

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
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

describe('loadCoinwaka', () => {
  it('requires a key', async () => {
    await expect(loadCoinwaka('')).rejects.toThrow(/required/i)
  })

  it('rejects a secret key', async () => {
    await expect(loadCoinwaka('cwk_test_sk_x')).rejects.toThrow(/publishable/i)
  })

  it('rejects a restricted key', async () => {
    await expect(loadCoinwaka('cwk_live_rk_x')).rejects.toThrow(/publishable/i)
  })

  it('returns a checkout client for a publishable key', async () => {
    const coinwaka = await loadCoinwaka(PK)
    expect(coinwaka).toBeInstanceOf(CoinwakaCheckout)
  })
})

describe('CoinwakaCheckout', () => {
  it('retrievePaymentIntent sends the publishable key and parses the body', async () => {
    const fetchMock = stubFetch(() =>
      mockResponse(200, { id: 'pi_1', status: 'requires_payment', checkout_url: 'https://pay.coinwaka.com/c/pi_1' }),
    )
    const coinwaka = await loadCoinwaka(PK)
    const intent = await coinwaka.retrievePaymentIntent('pi_1')
    expect(intent.id).toBe('pi_1')
    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit]
    expect(String(url)).toBe('https://api.coinwaka.com/v1/payment-intents/pi_1')
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${PK}`)
  })

  it('throws CoinwakaCheckoutError on a non-2xx', async () => {
    stubFetch(() => mockResponse(403, { error: { code: 'publishable_key_not_allowed', message: 'nope' } }))
    const coinwaka = await loadCoinwaka(PK)
    const err = await coinwaka.retrievePaymentIntent('pi_1').catch((e) => e)
    expect(err).toBeInstanceOf(CoinwakaCheckoutError)
    expect((err as CoinwakaCheckoutError).code).toBe('publishable_key_not_allowed')
  })

  it('redirectToCheckout navigates to the checkout_url', async () => {
    const assign = vi.fn()
    vi.stubGlobal('window', { location: { assign } })
    stubFetch(() => mockResponse(200, { id: 'pi_1', status: 'requires_payment', checkout_url: 'https://pay.coinwaka.com/c/pi_1' }))
    const coinwaka = await loadCoinwaka(PK)
    await coinwaka.redirectToCheckout({ paymentIntentId: 'pi_1' })
    expect(assign).toHaveBeenCalledWith('https://pay.coinwaka.com/c/pi_1')
  })

  it('redirectToCheckout throws when there is no checkout_url', async () => {
    vi.stubGlobal('window', { location: { assign: vi.fn() } })
    stubFetch(() => mockResponse(200, { id: 'pi_1', status: 'paid', checkout_url: '' }))
    const coinwaka = await loadCoinwaka(PK)
    await expect(coinwaka.redirectToCheckout({ paymentIntentId: 'pi_1' })).rejects.toMatchObject({
      code: 'no_checkout_url',
    })
  })
})
