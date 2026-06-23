import type { Coinwaka } from '../client.js'
import type { ListResponse, Settlement } from '../types.js'

export interface ListSettlementsParams {
  limit?: number
  starting_after?: string
  status?: string
}

export class SettlementsResource {
  constructor(private readonly client: Coinwaka) {}

  list(params: ListSettlementsParams = {}): Promise<ListResponse<Settlement>> {
    return this.client.request('GET', '/settlements', { query: { ...params } })
  }
}
