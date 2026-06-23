/** Shared types for the Coinwaka SDK. Resource payloads are pragmatic subsets:
 *  unknown fields pass through, so a forward-compatible API never breaks a build. */

export type CoinwakaEnvironment = 'sandbox' | 'live'

export interface CoinwakaOptions {
  /** Your secret (`cwk_…_sk_`) or restricted (`cwk_…_rk_`) key. Never a public key. */
  secretKey: string
  /** Informational; the key prefix selects test vs live server-side. */
  environment?: CoinwakaEnvironment
  /** Override the API base URL (default `https://api.coinwaka.com/v1`). */
  baseUrl?: string
  /** Per-request timeout in ms (default 30000). */
  timeoutMs?: number
  /** Max automatic retries for safe/idempotent requests (default 2). */
  maxRetries?: number
}

/** Per-call options for money-moving create requests. */
export interface RequestOptions {
  /** Replaying the same key returns the original result instead of acting twice. */
  idempotencyKey?: string
}

export interface ListResponse<T> {
  object: 'list'
  data: T[]
  has_more: boolean
}

interface EnvelopeFields {
  request_id?: string
  environment?: CoinwakaEnvironment
  livemode?: boolean
}

export type SettlementCurrency = 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'SOL'
export type PaymentMethod = 'coinwaka_balance' | 'mpesa' | 'card' | 'paypal' | 'external_wallet'

export interface PaymentIntent extends EnvelopeFields {
  id: string
  object?: 'payment_intent'
  status: string
  amount: string
  currency: string
  settlement_currency: string
  pay_amount: string | null
  pay_asset?: string
  checkout_url: string
  merchant_reference: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  expires_at: string
}

export interface CreatePaymentIntentParams {
  amount: string
  currency: string
  settlement_currency?: SettlementCurrency
  description?: string
  merchant_reference?: string
  payment_methods?: PaymentMethod[]
  customer?: { id?: string; email?: string; phone?: string }
  metadata?: Record<string, unknown>
  expires_in_minutes?: number
}

export interface PaymentLink extends EnvelopeFields {
  id: string
  object: 'payment_link'
  url: string
  qr_code_url?: string
  status: string
  paid_count: number
  max_payments: number | null
}

export interface CreatePaymentLinkParams {
  title: string
  currency: string
  amount?: string
  settlement_currency?: SettlementCurrency
  description?: string
  max_payments?: number
  expires_at?: string
  metadata?: Record<string, unknown>
}

export interface Refund extends EnvelopeFields {
  id: string
  object: 'refund'
  payment_intent: string
  amount: string
  asset: string
  status: 'requested' | 'succeeded' | 'failed'
  reason: string | null
  created_at: string
}

export interface Customer extends EnvelopeFields {
  id: string
  object: 'customer'
  email: string | null
  phone: string | null
  name: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface CreateCustomerParams {
  email?: string
  phone?: string
  name?: string
  metadata?: Record<string, unknown>
}

export interface Balance extends EnvelopeFields {
  object: 'balance'
  available: Array<{ asset: string; amount: string }>
  pending: Array<{ asset: string; amount: string }>
}

export interface Settlement extends EnvelopeFields {
  id: string
  object: 'settlement'
  asset: string
  amount: string
  status: string
  created_at: string
}

export interface WebhookEndpoint extends EnvelopeFields {
  id: string
  object: 'webhook_endpoint'
  url: string
  enabled_events: string[]
  status: string
  secret?: string
  created_at: string
}

export interface CreateWebhookEndpointParams {
  url: string
  enabled_events?: string[]
  description?: string
}

export interface WebhookEvent extends EnvelopeFields {
  id: string
  object: 'event'
  type: string
  api_version: string
  created_at: string
  data: Record<string, unknown>
}

export interface AuthVerifyResult extends EnvelopeFields {
  merchant_id: string
  app_id: string | null
  key_id: string
  scopes: string[]
  ip_allowed: boolean
  status: string
}
