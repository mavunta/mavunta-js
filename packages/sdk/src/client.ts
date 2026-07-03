import { randomUUID } from 'node:crypto'
import {
  MavuntaConnectionError,
  MavuntaTimeoutError,
  errorFromResponse,
  type MavuntaErrorBody,
} from './errors.js'
import type { MavuntaOptions } from './types.js'
import { AuthResource } from './resources/auth.js'
import { RatesResource } from './resources/rates.js'
import { QuotesResource } from './resources/quotes.js'
import { PaymentIntentsResource } from './resources/payment-intents.js'
import { PaymentLinksResource } from './resources/payment-links.js'
import { CustomersResource } from './resources/customers.js'
import { RefundsResource } from './resources/refunds.js'
import { BalancesResource } from './resources/balances.js'
import { SettlementsResource } from './resources/settlements.js'
import { ReportsResource } from './resources/reports.js'
import { WebhookEndpointsResource } from './resources/webhook-endpoints.js'
import { WebhookEventsResource } from './resources/webhook-events.js'
import { SandboxResource } from './resources/sandbox.js'
import { WebhooksResource } from './webhooks/index.js'

const DEFAULT_BASE_URL = 'https://api.mavunta.com/v1'
const API_VERSION = '2026-06-01'
const SDK_VERSION = '1.0.0'

type HttpMethod = 'GET' | 'POST' | 'DELETE'

export interface InternalRequestOptions {
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  idempotencyKey?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfterMs(header: string | null): number | null {
  if (!header) return null
  const seconds = Number(header)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(header)
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null
}

/**
 * The Mavunta API client. Server-side only: it authenticates with a secret or
 * restricted key and must never run in a browser.
 *
 * ```ts
 * import Mavunta from 'mavunta'
 * const mavunta = new Mavunta({ secretKey: process.env.MAVUNTA_SECRET_KEY! })
 * const intent = await mavunta.paymentIntents.create({
 *   amount: '2500', currency: 'KES', settlement_currency: 'USDT',
 *   payment_methods: ['mpesa', 'card'],
 * })
 * ```
 */
export class Mavunta {
  readonly auth: AuthResource
  readonly rates: RatesResource
  readonly quotes: QuotesResource
  readonly paymentIntents: PaymentIntentsResource
  readonly paymentLinks: PaymentLinksResource
  readonly customers: CustomersResource
  readonly refunds: RefundsResource
  readonly balances: BalancesResource
  readonly settlements: SettlementsResource
  readonly reports: ReportsResource
  readonly webhookEndpoints: WebhookEndpointsResource
  readonly webhookEvents: WebhookEventsResource
  readonly sandbox: SandboxResource
  /** Webhook signature verification (no network call). */
  readonly webhooks: WebhooksResource

  private readonly secretKey: string
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly maxRetries: number

  constructor(options: MavuntaOptions) {
    if (!options || !options.secretKey) {
      throw new Error('Mavunta: `secretKey` is required.')
    }
    if (/_pk_/.test(options.secretKey)) {
      throw new Error(
        'Mavunta: a public key (pk_) cannot be used here. The server SDK needs a secret (sk_) or restricted (rk_) key.',
      )
    }
    this.secretKey = options.secretKey
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeoutMs = options.timeoutMs ?? 30_000
    this.maxRetries = Math.max(0, options.maxRetries ?? 2)

    this.auth = new AuthResource(this)
    this.rates = new RatesResource(this)
    this.quotes = new QuotesResource(this)
    this.paymentIntents = new PaymentIntentsResource(this)
    this.paymentLinks = new PaymentLinksResource(this)
    this.customers = new CustomersResource(this)
    this.refunds = new RefundsResource(this)
    this.balances = new BalancesResource(this)
    this.settlements = new SettlementsResource(this)
    this.reports = new ReportsResource(this)
    this.webhookEndpoints = new WebhookEndpointsResource(this)
    this.webhookEvents = new WebhookEventsResource(this)
    this.sandbox = new SandboxResource(this)
    this.webhooks = new WebhooksResource()
  }

  /** @internal Used by resource classes; not part of the public surface. */
  async request<T>(method: HttpMethod, path: string, opts: InternalRequestOptions = {}): Promise<T> {
    const url = new URL(this.baseUrl + path)
    if (opts.query) {
      for (const [key, value] of Object.entries(opts.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value))
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      Accept: 'application/json',
      'Mavunta-Version': API_VERSION,
      'User-Agent': `mavunta-sdk/${SDK_VERSION}`,
    }
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

    // Money-moving POSTs are made retry-safe with an idempotency key (explicit
    // or auto-generated) so an automatic retry can never double-charge.
    const idempotencyKey =
      opts.idempotencyKey ?? (method === 'POST' ? `cwk_sdk_${randomUUID()}` : undefined)
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

    let lastError: unknown
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method,
          headers,
          body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
          signal: AbortSignal.timeout(this.timeoutMs),
        })

        const text = await res.text()
        const json = text ? (JSON.parse(text) as unknown) : {}
        if (res.ok) return json as T

        // Retry transient server / rate-limit errors. POSTs are safe here
        // because every POST carries an idempotency key.
        if ((res.status === 429 || res.status >= 500) && attempt < this.maxRetries) {
          const retryAfter = parseRetryAfterMs(res.headers.get('retry-after'))
          await sleep(retryAfter ?? 250 * 2 ** attempt)
          continue
        }

        const body = (json as { error?: MavuntaErrorBody }).error ?? null
        throw errorFromResponse(res.status, body, parseRetryAfterMs(res.headers.get('retry-after')))
      } catch (err) {
        // A built error envelope is final; rethrow it.
        if (err instanceof Error && err.name.startsWith('Mavunta')) throw err
        lastError = err
        const isTimeout = err instanceof Error && err.name === 'TimeoutError'
        if (attempt < this.maxRetries) {
          await sleep(250 * 2 ** attempt)
          continue
        }
        if (isTimeout) {
          throw new MavuntaTimeoutError(`Mavunta: request timed out after ${this.timeoutMs}ms.`, {
            code: 'timeout',
          })
        }
      }
    }
    throw new MavuntaConnectionError(
      `Mavunta: request failed (${lastError instanceof Error ? lastError.message : String(lastError)}).`,
      { code: 'connection_error' },
    )
  }
}
