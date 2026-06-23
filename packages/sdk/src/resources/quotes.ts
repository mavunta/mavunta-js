import type { Coinwaka } from '../client.js'

export interface CreateQuoteParams {
  source_currency: string
  target_asset: string
  amount: string
  side?: 'customer_pays' | 'merchant_receives'
}

export class QuotesResource {
  constructor(private readonly client: Coinwaka) {}

  /** Create a short-lived quote locking a rate for a conversion. */
  create(params: CreateQuoteParams): Promise<Record<string, unknown>> {
    return this.client.request('POST', '/quotes', { body: params })
  }
}
