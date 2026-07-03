/**
 * @mavunta/react — React components and hooks for Mavunta Pay checkout.
 *
 * Wraps @mavunta/checkout-js (publishable key, browser only). Your backend
 * creates the payment intent with a secret key via @mavunta/sdk.
 *
 * Mavunta is a product of Chainwaka Technologies. Not affiliated with CoinW.
 */
export { MavuntaCheckoutButton } from './MavuntaCheckoutButton.js'
export type { MavuntaCheckoutButtonProps } from './MavuntaCheckoutButton.js'
export { useMavuntaCheckout } from './useMavuntaCheckout.js'
export type { UseMavuntaCheckout } from './useMavuntaCheckout.js'
export { useMavuntaPaymentStatus } from './useMavuntaPaymentStatus.js'
export type { UseMavuntaPaymentStatus } from './useMavuntaPaymentStatus.js'

export { MavuntaCheckoutError } from '@mavunta/checkout-js'
export type { PaymentIntentView, CheckoutOptions } from '@mavunta/checkout-js'
