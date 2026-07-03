# mavunta

Official TypeScript and JavaScript SDK for the Mavunta API.

Mavunta helps merchants accept **M-Pesa, card, PayPal, Mavunta Balance, and crypto** payments, with settlement to **USDT, USDC, BTC, ETH, or SOL**. Create a payment intent, send the customer to hosted checkout, then confirm the result with signed webhooks.

> Server-side only. This package uses your **secret** (`cwk_…_sk_`) or **restricted** (`cwk_…_rk_`) key and must never run in a browser.

## Installation

```bash
npm install mavunta
```

`npm install mavunta` also works (it re-exports this package).

## Quick start

```ts
import Mavunta from 'mavunta'

const mavunta = new Mavunta({
  secretKey: process.env.MAVUNTA_SECRET_KEY!,
  environment: 'sandbox', // informational; the key prefix selects the mode
})
```

## Create a payment intent

```ts
const intent = await mavunta.paymentIntents.create({
  amount: '2500',
  currency: 'KES',
  settlement_currency: 'USDT',
  payment_methods: ['mpesa', 'card', 'paypal', 'mavunta_balance'],
  customer: { email: 'customer@example.com', phone: '+254712345678' },
  metadata: { orderId: 'ORD-1001' },
})

// Redirect the customer to complete payment:
return intent.checkout_url
```

## Payment links and QR

```ts
const link = await mavunta.paymentLinks.create({
  title: 'Order #1001',
  amount: '2500',
  currency: 'KES',
  settlement_currency: 'USDT',
})
// link.url, link.qr_code_url
```

## Verify webhooks

Payment results are asynchronous (M-Pesa, card redirects, crypto confirmations), so confirm them with signed webhooks. Always use the **raw** request body.

```ts
import express from 'express'
import Mavunta from 'mavunta'

const mavunta = new Mavunta({ secretKey: process.env.MAVUNTA_SECRET_KEY! })

app.post('/mavunta/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event
  try {
    event = mavunta.webhooks.verify({
      payload: req.body, // raw Buffer
      signature: req.headers['mavunta-signature'] as string,
      timestamp: req.headers['mavunta-timestamp'] as string,
      secret: process.env.MAVUNTA_WEBHOOK_SECRET!,
    })
  } catch {
    return res.sendStatus(400)
  }

  if (event.type === 'payment_intent.paid') {
    // fulfil the order (idempotently)
  }
  res.sendStatus(200)
})
```

Only need verification? Import it standalone:

```ts
import { verifyWebhook } from 'mavunta/webhooks'
```

## Sandbox and live mode

The key prefix selects the mode (`cwk_test_…` vs `cwk_live_…`); responses carry `environment` and `livemode`. In sandbox you can simulate events:

```ts
await mavunta.sandbox.triggerWebhook({ type: 'payment_intent.paid' })
```

## API keys

| Key | Where | Can do |
| --- | --- | --- |
| `cwk_…_sk_` (secret) | Backend | Create and read objects |
| `cwk_…_rk_` (restricted) | Backend | Scoped subset of the above |

Never embed a secret key in a browser, mobile app, or public repo.

## Idempotency

Every money-moving create is retry-safe. Pass your own key, or let the SDK generate one per request:

```ts
await mavunta.paymentIntents.create(params, { idempotencyKey: 'order_1001_attempt_1' })
```

## Errors

```ts
import { MavuntaError, MavuntaValidationError } from 'mavunta'

try {
  await mavunta.paymentIntents.create(params)
} catch (err) {
  if (err instanceof MavuntaValidationError) {
    console.log(err.code, err.param)
  } else if (err instanceof MavuntaError) {
    console.log(err.code, err.requestId, err.statusCode)
  }
}
```

Classes: `MavuntaError`, `MavuntaAPIError`, `MavuntaAuthenticationError`, `MavuntaPermissionError`, `MavuntaValidationError`, `MavuntaIdempotencyError`, `MavuntaRateLimitError`, `MavuntaConnectionError`, `MavuntaTimeoutError`, `MavuntaWebhookSignatureError`.

## Resources

`auth`, `rates`, `quotes`, `paymentIntents`, `paymentLinks`, `customers`, `refunds`, `balances`, `settlements`, `reports`, `webhookEndpoints`, `webhookEvents`, `sandbox`, `webhooks` (verify).

## Security

- Keep secret keys on the server and out of version control.
- Verify every webhook signature before acting; return `2xx` quickly.
- Treat confirmed crypto and payout events as final.

## Support

- Website: https://www.mavunta.com
- Developers: https://developers.mavunta.com
- Status: https://status.mavunta.com
- Support: support@mavunta.com
- Security: security@mavunta.com

## License

MIT © Chainwaka Technologies.
