# @mavunta/react

React components and hooks for **Mavunta Pay** checkout. Wraps [`@mavunta/checkout-js`](https://www.npmjs.com/package/@mavunta/checkout-js) (publishable key, browser only); your backend creates the payment intent with a secret key via [`@mavunta/sdk`](https://www.npmjs.com/package/@mavunta/sdk).

## Install

```bash
npm install @mavunta/react react
```

## Checkout button

```tsx
import { MavuntaCheckoutButton } from '@mavunta/react'

export function PayButton({ paymentIntentId }: { paymentIntentId: string }) {
  return (
    <MavuntaCheckoutButton
      publicKey="cwk_test_pk_…"
      paymentIntentId={paymentIntentId}
      onError={(e) => console.error(e)}
    >
      Pay with Mavunta
    </MavuntaCheckoutButton>
  )
}
```

Success is confirmed server-side via webhooks after the redirect, so there is no `onSuccess` on the button.

## Hooks

```tsx
import { useMavuntaCheckout, useMavuntaPaymentStatus } from '@mavunta/react'

// imperative checkout
const { redirectToCheckout, loading, error } = useMavuntaCheckout('cwk_test_pk_…')

// poll a payment's status inline (e.g. a "waiting for payment" screen)
const { status, intent } = useMavuntaPaymentStatus('cwk_test_pk_…', paymentIntentId)
```

## Security

Use your **publishable** key only. A publishable key can read a single payment intent and nothing else; keep secret keys on your server.

## License

MIT © Chainwaka Technologies. Not affiliated with CoinW or any similarly named exchange.
