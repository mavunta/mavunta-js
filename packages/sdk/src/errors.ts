/**
 * Error hierarchy for the Mavunta SDK.
 *
 * Every failure surfaces as a {@link MavuntaError} subclass so callers can
 * branch on the type and read `code` / `requestId` for support. The shape
 * mirrors the API's error envelope (spec §24):
 *
 *   { error: { type, code, message, param, request_id, docs_url } }
 */

export interface MavuntaErrorBody {
  type?: string
  code?: string
  message?: string
  param?: string | null
  request_id?: string
  docs_url?: string
}

export interface MavuntaErrorInit {
  type?: string
  code?: string
  param?: string | null
  requestId?: string | null
  statusCode?: number | null
  docsUrl?: string | null
}

/** Base class for everything thrown by the SDK. */
export class MavuntaError extends Error {
  readonly type: string
  readonly code: string
  readonly param: string | null
  readonly requestId: string | null
  readonly statusCode: number | null
  readonly docsUrl: string | null

  constructor(message: string, init: MavuntaErrorInit = {}) {
    super(message)
    this.name = this.constructor.name
    this.type = init.type ?? 'api_error'
    this.code = init.code ?? 'unknown'
    this.param = init.param ?? null
    this.requestId = init.requestId ?? null
    this.statusCode = init.statusCode ?? null
    this.docsUrl = init.docsUrl ?? null
  }
}

/** A non-2xx response that does not map to a more specific class. */
export class MavuntaAPIError extends MavuntaError {}
/** 401: missing, invalid, or revoked API key. */
export class MavuntaAuthenticationError extends MavuntaError {}
/** 403: the key is valid but lacks the scope for this action. */
export class MavuntaPermissionError extends MavuntaError {}
/** 400 / 422: the request was malformed or failed validation. */
export class MavuntaValidationError extends MavuntaError {}
/** 409 on a money-moving create with a reused idempotency key. */
export class MavuntaIdempotencyError extends MavuntaError {}
/** A network failure before a response was received. */
export class MavuntaConnectionError extends MavuntaError {}
/** The request exceeded the configured timeout. */
export class MavuntaTimeoutError extends MavuntaError {}
/** Webhook signature verification failed. */
export class MavuntaWebhookSignatureError extends MavuntaError {}

/** 429: too many requests. `retryAfterMs` is parsed from `retry-after`. */
export class MavuntaRateLimitError extends MavuntaError {
  readonly retryAfterMs: number | null
  constructor(message: string, init: MavuntaErrorInit & { retryAfterMs?: number | null } = {}) {
    super(message, init)
    this.retryAfterMs = init.retryAfterMs ?? null
  }
}

/**
 * Build the right error subclass from an HTTP status + the parsed body. Used by
 * the client for every non-2xx response.
 */
export function errorFromResponse(
  status: number,
  body: MavuntaErrorBody | null,
  retryAfterMs: number | null = null,
): MavuntaError {
  const init: MavuntaErrorInit = {
    type: body?.type,
    code: body?.code,
    param: body?.param ?? null,
    requestId: body?.request_id ?? null,
    statusCode: status,
    docsUrl: body?.docs_url ?? null,
  }
  const message = body?.message ?? `Mavunta API error (HTTP ${status})`

  if (status === 401) return new MavuntaAuthenticationError(message, init)
  if (status === 403) return new MavuntaPermissionError(message, init)
  if (status === 429) return new MavuntaRateLimitError(message, { ...init, retryAfterMs })
  if (status === 409 || body?.type === 'idempotency_error')
    return new MavuntaIdempotencyError(message, init)
  if (status === 400 || status === 422 || body?.type === 'validation_error')
    return new MavuntaValidationError(message, init)
  return new MavuntaAPIError(message, init)
}
