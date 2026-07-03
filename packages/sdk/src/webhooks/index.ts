import { verifyWebhook, type VerifyWebhookParams } from './verify.js'
import type { WebhookEvent } from '../types.js'

export { verifyWebhook } from './verify.js'
export type { VerifyWebhookParams } from './verify.js'

/**
 * Webhook helpers, available both as `mavunta.webhooks` and standalone via the
 * `mavunta/webhooks` subpath (handy when you only need verification and
 * not a full client).
 */
export class WebhooksResource {
  /** Verify a webhook signature and return the parsed event, or throw. */
  verify(params: VerifyWebhookParams): WebhookEvent {
    return verifyWebhook(params)
  }
  /** Alias of {@link verify}, matching the wording in some platform docs. */
  constructEvent(params: VerifyWebhookParams): WebhookEvent {
    return verifyWebhook(params)
  }
}
