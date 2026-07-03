import type { Mavunta } from '../client.js'
import type { ListResponse, WebhookEvent } from '../types.js'

export interface ListWebhookEventsParams {
  limit?: number
  starting_after?: string
  type?: string
}

export class WebhookEventsResource {
  constructor(private readonly client: Mavunta) {}

  list(params: ListWebhookEventsParams = {}): Promise<ListResponse<WebhookEvent>> {
    return this.client.request('GET', '/webhook_events', { query: { ...params } })
  }

  retrieve(id: string): Promise<WebhookEvent> {
    return this.client.request('GET', `/webhook_events/${encodeURIComponent(id)}`)
  }

  /** Re-deliver an event to all subscribed endpoints. */
  resend(id: string): Promise<WebhookEvent> {
    return this.client.request('POST', `/webhook_events/${encodeURIComponent(id)}/resend`)
  }
}
