# coinwaka-js

The official Coinwaka developer SDKs for JavaScript and TypeScript.

| Package | What it is | Status |
| --- | --- | --- |
| [`@coinwaka/sdk`](packages/sdk) | Server-side SDK: payment intents, links, quotes, customers, refunds, balances, settlements, webhooks | ✅ Phase 1 |
| [`coinwaka`](packages/coinwaka) | Thin bridge so `npm install coinwaka` works (re-exports `@coinwaka/sdk`) | ✅ Phase 1 |
| [`@coinwaka/checkout-js`](packages/checkout-js) | Browser checkout: redirect to hosted checkout + poll status with a publishable key | ✅ Phase 2 |
| [`@coinwaka/react`](packages/react) | React components/hooks around checkout (`CoinwakaCheckoutButton`, `useCoinwakaCheckout`, `useCoinwakaPaymentStatus`) | ✅ Phase 3 |
| [`@coinwaka/cli`](packages/cli) | CLI: verify keys, trigger sandbox webhooks, and `listen` to forward live events to localhost | ✅ Phase 4 |

Server keys (`sk_` / `rk_`) belong on the backend; browser code will use a public key via `@coinwaka/checkout-js`.

## Quick start

```bash
npm install @coinwaka/sdk
```

```ts
import { Coinwaka } from '@coinwaka/sdk'

const coinwaka = new Coinwaka({ secretKey: process.env.COINWAKA_SECRET_KEY! })

const intent = await coinwaka.paymentIntents.create({
  amount: '2500',
  currency: 'KES',
  settlement_currency: 'USDT',
  payment_methods: ['mpesa', 'card', 'paypal', 'coinwaka_balance'],
})
// redirect to intent.checkout_url
```

See [`packages/sdk/README.md`](packages/sdk/README.md) for the full guide and [`examples/`](examples) for runnable code.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Links

- Developers: https://developers.coinwaka.com
- Status: https://status.coinwaka.com
- Support: support@coinwaka.com

## License

MIT © Chainwaka Technologies. Not affiliated with CoinW or any similarly named exchange.
