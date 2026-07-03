import { MavuntaCheckout } from './checkout.js'
import type { CheckoutOptions } from './types.js'

const DEFAULT_BASE_URL = 'https://api.mavunta.com/v1'

/**
 * Initialize browser checkout with your **publishable** key (`cwk_…_pk_…`).
 * Async to mirror other checkout SDKs (and to leave room for future async
 * setup); it resolves immediately today.
 *
 * ```ts
 * import { loadMavunta } from '@mavunta/checkout-js'
 * const mavunta = await loadMavunta('cwk_test_pk_…')
 * await mavunta.redirectToCheckout({ paymentIntentId: 'pi_…' })
 * ```
 */
export async function loadMavunta(
  publicKey: string,
  options: CheckoutOptions = {},
): Promise<MavuntaCheckout> {
  if (!publicKey) {
    throw new Error('loadMavunta: a publishable key is required.')
  }
  if (!/_pk_/.test(publicKey)) {
    throw new Error(
      'loadMavunta: use your PUBLISHABLE key (cwk_..._pk_...). Secret and restricted keys must never run in a browser.',
    )
  }
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
  return new MavuntaCheckout(publicKey, baseUrl)
}
