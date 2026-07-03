import type { Mavunta } from '../client.js'
import type {
  CreateWebhookEndpointParams,
  ListResponse,
  RequestOptions,
  WebhookEndpoint,
} from '../types.js'

export class WebhookEndpointsResource {
  constructor(private readonly client: Mavunta) {}

  create(
    params: CreateWebhookEndpointParams,
    options: RequestOptions = {},
  ): Promise<WebhookEndpoint> {
    return this.client.request('POST', '/webhook_endpoints', {
      body: params,
      idempotencyKey: options.idempotencyKey,
    })
  }

  retrieve(id: string): Promise<WebhookEndpoint> {
    return this.client.request('GET', `/webhook_endpoints/${encodeURIComponent(id)}`)
  }

  list(params: { limit?: number; starting_after?: string } = {}): Promise<
    ListResponse<WebhookEndpoint>
  > {
    return this.client.request('GET', '/webhook_endpoints', { query: { ...params } })
  }

  delete(id: string): Promise<{ id: string; object: string; deleted: boolean }> {
    return this.client.request('DELETE', `/webhook_endpoints/${encodeURIComponent(id)}`)
  }
}
