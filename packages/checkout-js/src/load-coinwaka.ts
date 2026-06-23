import { CoinwakaCheckout } from './checkout.js'
import type { CheckoutOptions } from './types.js'

const DEFAULT_BASE_URL = 'https://api.coinwaka.com/v1'

/**
 * Initialize browser checkout with your **publishable** key (`cwk_…_pk_…`).
 * Async to mirror other checkout SDKs (and to leave room for future async
 * setup); it resolves immediately today.
 *
 * ```ts
 * import { loadCoinwaka } from '@coinwaka/checkout-js'
 * const coinwaka = await loadCoinwaka('cwk_test_pk_…')
 * await coinwaka.redirectToCheckout({ paymentIntentId: 'pi_…' })
 * ```
 */
export async function loadCoinwaka(
  publicKey: string,
  options: CheckoutOptions = {},
): Promise<CoinwakaCheckout> {
  if (!publicKey) {
    throw new Error('loadCoinwaka: a publishable key is required.')
  }
  if (!/_pk_/.test(publicKey)) {
    throw new Error(
      'loadCoinwaka: use your PUBLISHABLE key (cwk_..._pk_...). Secret and restricted keys must never run in a browser.',
    )
  }
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
  return new CoinwakaCheckout(publicKey, baseUrl)
}
