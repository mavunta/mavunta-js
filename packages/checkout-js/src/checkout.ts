import { MavuntaCheckoutError, type CheckoutErrorBody } from './errors.js'
import type { OnStatusOptions, PaymentIntentView, StatusListener } from './types.js'

// Statuses after which polling should stop — the payment is settled one way or
// another and will not change again.
const TERMINAL_STATUSES = new Set([
  'paid',
  'failed',
  'expired',
  'cancelled',
  'canceled',
  'refunded',
])

/**
 * Browser checkout client. Created via {@link loadMavunta}; uses a publishable
 * key only. Its single read is `GET /v1/payment-intents/:id`, which the gateway
 * restricts publishable keys to.
 */
export class MavuntaCheckout {
  constructor(
    private readonly publicKey: string,
    private readonly baseUrl: string,
  ) {}

  /** Read the public view of a payment intent (status, checkout_url, etc.). */
  async retrievePaymentIntent(id: string): Promise<PaymentIntentView> {
    const res = await fetch(`${this.baseUrl}/payment-intents/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.publicKey}`, Accept: 'application/json' },
    })
    const text = await res.text()
    const json = text ? (JSON.parse(text) as unknown) : {}
    if (!res.ok) {
      const body = (json as { error?: CheckoutErrorBody }).error ?? null
      throw new MavuntaCheckoutError(res.status, body)
    }
    return json as PaymentIntentView
  }

  /**
   * Send the customer to the hosted checkout for an intent your backend already
   * created (with a secret key).
   */
  async redirectToCheckout(params: { paymentIntentId: string }): Promise<void> {
    const intent = await this.retrievePaymentIntent(params.paymentIntentId)
    if (!intent.checkout_url) {
      throw new MavuntaCheckoutError(null, {
        code: 'no_checkout_url',
        message: 'This payment intent has no checkout URL.',
      })
    }
    window.location.assign(intent.checkout_url)
  }

  /**
   * Poll an intent and call `listener` whenever the status changes, stopping at
   * a terminal status. Returns a function to stop early.
   */
  onStatus(id: string, listener: StatusListener, options: OnStatusOptions = {}): () => void {
    const intervalMs = Math.max(1000, options.intervalMs ?? 3000)
    let stopped = false
    let lastStatus: string | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    const stop = (): void => {
      stopped = true
      if (timer) clearTimeout(timer)
    }
    options.signal?.addEventListener('abort', stop, { once: true })

    const tick = async (): Promise<void> => {
      if (stopped) return
      try {
        const intent = await this.retrievePaymentIntent(id)
        if (stopped) return
        if (intent.status !== lastStatus) {
          lastStatus = intent.status
          listener(intent)
        }
        if (TERMINAL_STATUSES.has(intent.status)) {
          stop()
          return
        }
      } catch {
        /* transient network/API error — keep polling */
      }
      if (!stopped) timer = setTimeout(() => void tick(), intervalMs)
    }

    void tick()
    return stop
  }
}
