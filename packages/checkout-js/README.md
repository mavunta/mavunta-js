# @coinwaka/checkout-js

Browser checkout for **Coinwaka Pay**. Publishable key only — your backend creates the payment intent with a secret key (via [`@coinwaka/sdk`](https://www.npmjs.com/package/@coinwaka/sdk)); this package sends the customer to checkout and tracks the result.

## Install

```bash
npm install @coinwaka/checkout-js
```

Or from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@coinwaka/checkout-js"></script>
<!-- global: Coinwaka.loadCoinwaka(...) -->
```

## Redirect to hosted checkout

```ts
import { loadCoinwaka } from '@coinwaka/checkout-js'

// 1) Your backend created the intent with a secret key and sent you its id.
const coinwaka = await loadCoinwaka('cwk_test_pk_…')

// 2) Send the customer to pay.
await coinwaka.redirectToCheckout({ paymentIntentId: 'pi_…' })
```

## Track status inline

```ts
const stop = coinwaka.onStatus('pi_…', (intent) => {
  if (intent.status === 'paid') showSuccess()
  if (intent.status === 'failed') showFailure()
})
// stop() to cancel early; it stops itself once the payment settles.
```

## Security

- Use your **publishable** key (`cwk_…_pk_…`). `loadCoinwaka` throws if you pass a secret/restricted key.
- A publishable key can only read a single payment intent — it cannot list payments, issue refunds, or read any other resource. Keep secret keys on your server.
- For browser requests to work, add your site's origin to the key's allowed origins in the developer console (empty = any origin).

## Links

- Developers: https://developers.coinwaka.com
- Server SDK: https://www.npmjs.com/package/@coinwaka/sdk

## License

MIT © Chainwaka Technologies. Not affiliated with CoinW or any similarly named exchange.
