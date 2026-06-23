/**
 * @coinwaka/checkout-js — browser checkout for Coinwaka Pay.
 *
 * Publishable key only. Redirect to hosted checkout and poll payment status
 * from the browser; your backend creates the payment intent with a secret key
 * via @coinwaka/sdk.
 *
 * Coinwaka is a product of Chainwaka Technologies. Not affiliated with CoinW.
 */
export { loadCoinwaka } from './load-coinwaka.js'
export { CoinwakaCheckout } from './checkout.js'
export { CoinwakaCheckoutError } from './errors.js'
export type {
  CheckoutOptions,
  PaymentIntentView,
  StatusListener,
  OnStatusOptions,
} from './types.js'
