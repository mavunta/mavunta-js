import type { Coinwaka } from '../client.js'

export class RatesResource {
  constructor(private readonly client: Coinwaka) {}

  /** Current indicative FX and crypto rates used for quotes. */
  retrieve(): Promise<Record<string, unknown>> {
    return this.client.request('GET', '/rates')
  }

  /** Alias for {@link retrieve}. */
  list(): Promise<Record<string, unknown>> {
    return this.retrieve()
  }
}
