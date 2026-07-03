# @mavunta/checkout-js

Browser checkout for **Mavunta Pay**. Publishable key only — your backend creates the payment intent with a secret key (via [`@mavunta/sdk`](https://www.npmjs.com/package/@mavunta/sdk)); this package sends the customer to checkout and tracks the result.

## Install

```bash
npm install @mavunta/checkout-js
```

Or from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@mavunta/checkout-js"></script>
<!-- global: Mavunta.loadMavunta(...) -->
```

## Redirect to hosted checkout

```ts
import { loadMavunta } from '@mavunta/checkout-js'

// 1) Your backend created the intent with a secret key and sent you its id.
const mavunta = await loadMavunta('cwk_test_pk_…')

// 2) Send the customer to pay.
await mavunta.redirectToCheckout({ paymentIntentId: 'pi_…' })
```

## Track status inline

```ts
const stop = mavunta.onStatus('pi_…', (intent) => {
  if (intent.status === 'paid') showSuccess()
  if (intent.status === 'failed') showFailure()
})
// stop() to cancel early; it stops itself once the payment settles.
```

## Security

- Use your **publishable** key (`cwk_…_pk_…`). `loadMavunta` throws if you pass a secret/restricted key.
- A publishable key can only read a single payment intent — it cannot list payments, issue refunds, or read any other resource. Keep secret keys on your server.
- For browser requests to work, add your site's origin to the key's allowed origins in the developer console (empty = any origin).

## Links

- Developers: https://developers.mavunta.com
- Server SDK: https://www.npmjs.com/package/@mavunta/sdk

## License

MIT © Chainwaka Technologies. Not affiliated with CoinW or any similarly named exchange.
