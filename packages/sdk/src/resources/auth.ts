import type { Coinwaka } from '../client.js'
import type { AuthVerifyResult } from '../types.js'

export class AuthResource {
  constructor(private readonly client: Coinwaka) {}

  /** Verify the current API key and return its merchant, scopes, and mode. */
  verify(): Promise<AuthVerifyResult> {
    return this.client.request('GET', '/auth/verify')
  }
}
