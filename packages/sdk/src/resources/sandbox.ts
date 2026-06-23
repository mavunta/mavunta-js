import type { Coinwaka } from '../client.js'
import type { WebhookEvent } from '../types.js'

export interface TriggerWebhookParams {
  /** The event type to simulate, e.g. `payment_intent.paid`. */
  type: string
  /** Optional override data merged into the simulated event. */
  data?: Record<string, unknown>
}

/**
 * Sandbox-only test helpers. These work with a `cwk_test_…` key; calling them
 * with a live key returns an error from the API.
 */
export class SandboxResource {
  constructor(private readonly client: Coinwaka) {}

  /** Fire a simulated webhook event to your configured endpoints. */
  triggerWebhook(params: TriggerWebhookParams): Promise<WebhookEvent> {
    return this.client.request('POST', '/sandbox/webhooks/trigger', { body: params })
  }
}
