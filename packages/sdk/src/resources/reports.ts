import type { Mavunta } from '../client.js'

export interface ReportParams {
  /** ISO date or unix-seconds range bound, per the API docs. */
  from?: string
  to?: string
  limit?: number
  starting_after?: string
}

export class ReportsResource {
  constructor(private readonly client: Mavunta) {}

  /** Tabular payments report for reconciliation. */
  payments(params: ReportParams = {}): Promise<Record<string, unknown>> {
    return this.client.request('GET', '/reports/payments', { query: { ...params } })
  }

  /** Tabular settlements report for reconciliation. */
  settlements(params: ReportParams = {}): Promise<Record<string, unknown>> {
    return this.client.request('GET', '/reports/settlements', { query: { ...params } })
  }
}
