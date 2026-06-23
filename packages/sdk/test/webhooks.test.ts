import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyWebhook } from '../src/webhooks/verify.js'
import { CoinwakaWebhookSignatureError } from '../src/errors.js'

const SECRET = 'whsec_test_abc123'

function sign(body: string, timestamp: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
}

describe('verifyWebhook', () => {
  const body = JSON.stringify({ id: 'evt_1', type: 'payment_intent.paid', data: { id: 'pi_1' } })
  const now = String(Math.floor(Date.now() / 1000))

  it('accepts a valid signature and returns the parsed event', () => {
    const event = verifyWebhook({ payload: body, signature: sign(body, now), timestamp: now, secret: SECRET })
    expect(event.id).toBe('evt_1')
    expect(event.type).toBe('payment_intent.paid')
  })

  it('accepts a Buffer payload', () => {
    const event = verifyWebhook({
      payload: Buffer.from(body, 'utf8'),
      signature: sign(body, now),
      timestamp: now,
      secret: SECRET,
    })
    expect(event.id).toBe('evt_1')
  })

  it('rejects a tampered body', () => {
    expect(() =>
      verifyWebhook({ payload: body + ' ', signature: sign(body, now), timestamp: now, secret: SECRET }),
    ).toThrow(CoinwakaWebhookSignatureError)
  })

  it('rejects a wrong secret', () => {
    expect(() =>
      verifyWebhook({ payload: body, signature: sign(body, now, 'whsec_wrong'), timestamp: now, secret: SECRET }),
    ).toThrow(CoinwakaWebhookSignatureError)
  })

  it('rejects a stale timestamp', () => {
    const old = String(Math.floor(Date.now() / 1000) - 10_000)
    expect(() =>
      verifyWebhook({ payload: body, signature: sign(body, old), timestamp: old, secret: SECRET }),
    ).toThrow(/tolerance/i)
  })

  it('rejects a missing signature', () => {
    expect(() => verifyWebhook({ payload: body, signature: '', timestamp: now, secret: SECRET })).toThrow(
      CoinwakaWebhookSignatureError,
    )
  })
})
