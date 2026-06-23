export interface CheckoutOptions {
  /** Override the API base URL (default `https://api.coinwaka.com/v1`). */
  baseUrl?: string
}

/** The browser-visible view of a payment intent (public, read-only fields). */
export interface PaymentIntentView {
  id: string
  status: string
  amount: string
  currency: string
  settlement_currency?: string
  pay_amount?: string | null
  pay_asset?: string
  checkout_url: string
  expires_at?: string
  livemode?: boolean
  [key: string]: unknown
}

export type StatusListener = (intent: PaymentIntentView) => void

export interface OnStatusOptions {
  /** Poll interval in ms (min 1000, default 3000). */
  intervalMs?: number
  /** Abort to stop polling. */
  signal?: AbortSignal
}
