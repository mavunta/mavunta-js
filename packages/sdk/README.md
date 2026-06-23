# @coinwaka/sdk

Official TypeScript and JavaScript SDK for the Coinwaka API.

Coinwaka helps merchants accept **M-Pesa, card, PayPal, Coinwaka Balance, and crypto** payments, with settlement to **USDT, USDC, BTC, ETH, or SOL**. Create a payment intent, send the customer to hosted checkout, then confirm the result with signed webhooks.

> Server-side only. This package uses your **secret** (`cwk_…_sk_`) or **restricted** (`cwk_…_rk_`) key and must never run in a browser. Browser checkout will ship as `@coinwaka/checkout-js`.

## Installation

```bash
npm install @coinwaka/sdk
```

`npm install coinwaka` also works (it re-exports this package).

## Quick start

```ts
import { Coinwaka } from '@coinwaka/sdk'

const coinwaka = new Coinwaka({
  secretKey: process.env.COINWAKA_SECRET_KEY!,
  environment: 'sandbox', // informational; the key prefix selects the mode
})
```

## Create a payment intent

```ts
const intent = await coinwaka.paymentIntents.create({
  amount: '2500',
  currency: 'KES',
  settlement_currency: 'USDT',
  payment_methods: ['mpesa', 'card', 'paypal', 'coinwaka_balance'],
  customer: { email: 'customer@example.com', phone: '+254712345678' },
  metadata: { orderId: 'ORD-1001' },
})

// Redirect the customer to complete payment:
return intent.checkout_url
```

## Payment links and QR

```ts
const link = await coinwaka.paymentLinks.create({
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
import { Coinwaka } from '@coinwaka/sdk'

const coinwaka = new Coinwaka({ secretKey: process.env.COINWAKA_SECRET_KEY! })

app.post('/coinwaka/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event
  try {
    event = coinwaka.webhooks.verify({
      payload: req.body, // raw Buffer
      signature: req.headers['coinwaka-signature'] as string,
      timestamp: req.headers['coinwaka-timestamp'] as string,
      secret: process.env.COINWAKA_WEBHOOK_SECRET!,
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
import { verifyWebhook } from '@coinwaka/sdk/webhooks'
```

## Sandbox and live mode

The key prefix selects the mode (`cwk_test_…` vs `cwk_live_…`); responses carry `environment` and `livemode`. In sandbox you can simulate events:

```ts
await coinwaka.sandbox.triggerWebhook({ type: 'payment_intent.paid' })
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
await coinwaka.paymentIntents.create(params, { idempotencyKey: 'order_1001_attempt_1' })
```

## Errors

```ts
import { CoinwakaError, CoinwakaValidationError } from '@coinwaka/sdk'

try {
  await coinwaka.paymentIntents.create(params)
} catch (err) {
  if (err instanceof CoinwakaValidationError) {
    console.log(err.code, err.param)
  } else if (err instanceof CoinwakaError) {
    console.log(err.code, err.requestId, err.statusCode)
  }
}
```

Classes: `CoinwakaError`, `CoinwakaAPIError`, `CoinwakaAuthenticationError`, `CoinwakaPermissionError`, `CoinwakaValidationError`, `CoinwakaIdempotencyError`, `CoinwakaRateLimitError`, `CoinwakaConnectionError`, `CoinwakaTimeoutError`, `CoinwakaWebhookSignatureError`.

## Resources

`auth`, `rates`, `quotes`, `paymentIntents`, `paymentLinks`, `customers`, `refunds`, `balances`, `settlements`, `reports`, `webhookEndpoints`, `webhookEvents`, `sandbox`, `webhooks` (verify).

## Security

- Keep secret keys on the server and out of version control.
- Verify every webhook signature before acting; return `2xx` quickly.
- Treat confirmed crypto and payout events as final.

## Support

- Website: https://www.coinwaka.com
- Developers: https://developers.coinwaka.com
- Status: https://status.coinwaka.com
- Support: support@coinwaka.com
- Security: security@coinwaka.com

## License

MIT © Chainwaka Technologies. This package is not affiliated with CoinW or any similarly named exchange.
