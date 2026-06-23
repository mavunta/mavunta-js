import type { Coinwaka } from '../client.js'
import type { ListResponse, Refund, RequestOptions } from '../types.js'

export interface CreateRefundParams {
  payment_intent: string
  reason?: string
}

export class RefundsResource {
  constructor(private readonly client: Coinwaka) {}

  /**
   * Refund a paid payment in full. Partial refunds are not supported, and a
   * payment can have at most one refund (a repeat after success rejects with
   * `already_refunded`).
   */
  create(params: CreateRefundParams, options: RequestOptions = {}): Promise<Refund> {
    return this.client.request('POST', '/refunds', {
      body: params,
      idempotencyKey: options.idempotencyKey,
    })
  }

  retrieve(id: string): Promise<Refund> {
    return this.client.request('GET', `/refunds/${encodeURIComponent(id)}`)
  }

  list(params: { limit?: number; starting_after?: string } = {}): Promise<ListResponse<Refund>> {
    return this.client.request('GET', '/refunds', { query: { ...params } })
  }
}
