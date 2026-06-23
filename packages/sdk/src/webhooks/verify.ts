import { createHmac, timingSafeEqual } from 'node:crypto'
import { CoinwakaWebhookSignatureError } from '../errors.js'
import type { WebhookEvent } from '../types.js'

export interface VerifyWebhookParams {
  /** The raw request body, exactly as received (string or Buffer). Never the
   *  parsed JSON object: re-serializing changes the bytes and breaks the HMAC. */
  payload: string | Buffer
  /** The `Coinwaka-Signature` header (hex HMAC-SHA256). */
  signature: string
  /** The `Coinwaka-Timestamp` header (unix seconds). */
  timestamp: string
  /** The endpoint's signing secret (`whsec_…`). */
  secret: string
  /** Reject timestamps older/newer than this many seconds (default 300). */
  toleranceSec?: number
}

function fail(message: string): never {
  throw new CoinwakaWebhookSignatureError(message, { type: 'webhook_signature_error', code: 'invalid_signature' })
}

/**
 * Verify a webhook signature and return the parsed event, or throw a
 * {@link CoinwakaWebhookSignatureError}.
 *
 * The signature is HMAC-SHA256 (hex) over `"<timestamp>.<rawBody>"`, where
 * `timestamp` is the `Coinwaka-Timestamp` header and the digest is the
 * `Coinwaka-Signature` header. Always pass the raw body, not parsed JSON.
 */
export function verifyWebhook(params: VerifyWebhookParams): WebhookEvent {
  const { signature, timestamp, secret } = params
  if (!signature) fail('Missing Coinwaka-Signature header.')
  if (!timestamp) fail('Missing Coinwaka-Timestamp header.')
  if (!secret) fail('Missing webhook signing secret.')

  const raw = typeof params.payload === 'string' ? params.payload : params.payload.toString('utf8')
  const tolerance = params.toleranceSec ?? 300

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) fail('Invalid Coinwaka-Timestamp header.')
  if (Math.abs(Date.now() / 1000 - ts) > tolerance) fail('Timestamp outside the tolerance window.')

  const expected = createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex')
  let a: Buffer
  let b: Buffer
  try {
    a = Buffer.from(expected, 'hex')
    b = Buffer.from(signature, 'hex')
  } catch {
    fail('Malformed signature.')
  }
  if (a.length !== b.length || !timingSafeEqual(a, b)) fail('Signature mismatch.')

  return JSON.parse(raw) as WebhookEvent
}
