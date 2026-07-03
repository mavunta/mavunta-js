import type { Mavunta } from '../client.js'
import type { ListResponse, Settlement } from '../types.js'

export interface ListSettlementsParams {
  limit?: number
  starting_after?: string
  status?: string
}

export class SettlementsResource {
  constructor(private readonly client: Mavunta) {}

  list(params: ListSettlementsParams = {}): Promise<ListResponse<Settlement>> {
    return this.client.request('GET', '/settlements', { query: { ...params } })
  }
}
