# @coinwaka/react

React components and hooks for **Coinwaka Pay** checkout. Wraps [`@coinwaka/checkout-js`](https://www.npmjs.com/package/@coinwaka/checkout-js) (publishable key, browser only); your backend creates the payment intent with a secret key via [`@coinwaka/sdk`](https://www.npmjs.com/package/@coinwaka/sdk).

## Install

```bash
npm install @coinwaka/react react
```

## Checkout button

```tsx
import { CoinwakaCheckoutButton } from '@coinwaka/react'

export function PayButton({ paymentIntentId }: { paymentIntentId: string }) {
  return (
    <CoinwakaCheckoutButton
      publicKey="cwk_test_pk_…"
      paymentIntentId={paymentIntentId}
      onError={(e) => console.error(e)}
    >
      Pay with Coinwaka
    </CoinwakaCheckoutButton>
  )
}
```

Success is confirmed server-side via webhooks after the redirect, so there is no `onSuccess` on the button.

## Hooks

```tsx
import { useCoinwakaCheckout, useCoinwakaPaymentStatus } from '@coinwaka/react'

// imperative checkout
const { redirectToCheckout, loading, error } = useCoinwakaCheckout('cwk_test_pk_…')

// poll a payment's status inline (e.g. a "waiting for payment" screen)
const { status, intent } = useCoinwakaPaymentStatus('cwk_test_pk_…', paymentIntentId)
```

## Security

Use your **publishable** key only. A publishable key can read a single payment intent and nothing else; keep secret keys on your server.

## License

MIT © Chainwaka Technologies. Not affiliated with CoinW or any similarly named exchange.
