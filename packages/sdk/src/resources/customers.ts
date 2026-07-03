import type { Mavunta } from '../client.js'
import type { CreateCustomerParams, Customer, ListResponse, RequestOptions } from '../types.js'

export interface ListCustomersParams {
  limit?: number
  starting_after?: string
  email?: string
}

export class CustomersResource {
  constructor(private readonly client: Mavunta) {}

  create(params: CreateCustomerParams, options: RequestOptions = {}): Promise<Customer> {
    return this.client.request('POST', '/customers', {
      body: params,
      idempotencyKey: options.idempotencyKey,
    })
  }

  retrieve(id: string): Promise<Customer> {
    return this.client.request('GET', `/customers/${encodeURIComponent(id)}`)
  }

  list(params: ListCustomersParams = {}): Promise<ListResponse<Customer>> {
    return this.client.request('GET', '/customers', { query: { ...params } })
  }
}
