/**
 * @mavunta/checkout-js — browser checkout for Mavunta Pay.
 *
 * Publishable key only. Redirect to hosted checkout and poll payment status
 * from the browser; your backend creates the payment intent with a secret key
 * via @mavunta/sdk.
 *
 * Mavunta is a product of Chainwaka Technologies. Not affiliated with CoinW.
 */
export { loadMavunta } from './load-mavunta.js'
export { MavuntaCheckout } from './checkout.js'
export { MavuntaCheckoutError } from './errors.js'
export type {
  CheckoutOptions,
  PaymentIntentView,
  StatusListener,
  OnStatusOptions,
} from './types.js'
