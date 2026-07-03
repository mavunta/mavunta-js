import type { Mavunta } from '../client.js'
import type { AuthVerifyResult } from '../types.js'

export class AuthResource {
  constructor(private readonly client: Mavunta) {}

  /** Verify the current API key and return its merchant, scopes, and mode. */
  verify(): Promise<AuthVerifyResult> {
    return this.client.request('GET', '/auth/verify')
  }
}
