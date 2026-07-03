import type { Mavunta } from '../client.js'
import type { CreatePaymentLinkParams, PaymentLink, RequestOptions } from '../types.js'

export class PaymentLinksResource {
  constructor(private readonly client: Mavunta) {}

  /** Create a reusable payment link (with a hosted page + QR). */
  create(params: CreatePaymentLinkParams, options: RequestOptions = {}): Promise<PaymentLink> {
    return this.client.request('POST', '/payment-links', {
      body: params,
      idempotencyKey: options.idempotencyKey,
    })
  }

  retrieve(id: string): Promise<PaymentLink> {
    return this.client.request('GET', `/payment-links/${encodeURIComponent(id)}`)
  }
}
