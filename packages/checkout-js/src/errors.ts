export interface CheckoutErrorBody {
  type?: string
  code?: string
  message?: string
  request_id?: string
}

export class CoinwakaCheckoutError extends Error {
  readonly code: string
  readonly statusCode: number | null
  readonly requestId: string | null

  constructor(statusCode: number | null, body?: CheckoutErrorBody | null, fallback?: string) {
    super(
      body?.message ?? fallback ?? `Coinwaka checkout error${statusCode ? ` (HTTP ${statusCode})` : ''}`,
    )
    this.name = 'CoinwakaCheckoutError'
    this.code = body?.code ?? 'checkout_error'
    this.statusCode = statusCode
    this.requestId = body?.request_id ?? null
  }
}
