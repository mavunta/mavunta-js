import type { Coinwaka } from '../client.js'
import type { Balance } from '../types.js'

export class BalancesResource {
  constructor(private readonly client: Coinwaka) {}

  /** Retrieve the merchant's available and pending balances by asset. */
  retrieve(): Promise<Balance> {
    return this.client.request('GET', '/balances')
  }
}
