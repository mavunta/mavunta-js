import type { Coinwaka } from '../client.js'
import type {
  CreatePaymentIntentParams,
  ListResponse,
  PaymentIntent,
  RequestOptions,
} from '../types.js'

export interface ListPaymentIntentsParams {
  limit?: number
  starting_after?: string
  status?: string
}

export class PaymentIntentsResource {
  constructor(private readonly client: Coinwaka) {}

  /** Create a payment intent and get a `checkout_url` to send the customer to. */
  create(
    params: CreatePaymentIntentParams,
    options: RequestOptions = {},
  ): Promise<PaymentIntent> {
    return this.client.request('POST', '/payment-intents', {
      body: params,
      idempotencyKey: options.idempotencyKey,
    })
  }

  retrieve(id: string): Promise<PaymentIntent> {
    return this.client.request('GET', `/payment-intents/${encodeURIComponent(id)}`)
  }

  list(params: ListPaymentIntentsParams = {}): Promise<ListResponse<PaymentIntent>> {
    return this.client.request('GET', '/payment-intents', { query: { ...params } })
  }

  /** Cancel an intent that has not been paid yet. */
  cancel(id: string): Promise<PaymentIntent> {
    return this.client.request('POST', `/payment-intents/${encodeURIComponent(id)}/cancel`)
  }
}
