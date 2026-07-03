/**
 * mavunta — Official TypeScript and JavaScript SDK for the Mavunta API.
 *
 * Server-side only. Build Mavunta Pay: M-Pesa, card, PayPal, Mavunta Balance,
 * and crypto payments with USDT/USDC/BTC/ETH/SOL settlement, payment links,
 * and signed webhooks.
 *
 * ```ts
 * import Mavunta from 'mavunta'
 *
 * const mavunta = new Mavunta({ secretKey: process.env.MAVUNTA_SECRET_KEY! })
 *
 * const intent = await mavunta.paymentIntents.create({
 *   amount: '2500',
 *   currency: 'KES',
 *   settlement_currency: 'USDT',
 *   payment_methods: ['mpesa', 'card', 'paypal', 'mavunta_balance'],
 * })
 * // → redirect the customer to intent.checkout_url
 * ```
 *
 * Mavunta is a product of Chainwaka Technologies.
 */

export { Mavunta } from './client.js'
export { Mavunta as default } from './client.js'

export {
  MavuntaError,
  MavuntaAPIError,
  MavuntaAuthenticationError,
  MavuntaPermissionError,
  MavuntaValidationError,
  MavuntaIdempotencyError,
  MavuntaRateLimitError,
  MavuntaConnectionError,
  MavuntaTimeoutError,
  MavuntaWebhookSignatureError,
} from './errors.js'
export type { MavuntaErrorBody } from './errors.js'

export { verifyWebhook } from './webhooks/verify.js'
export type { VerifyWebhookParams } from './webhooks/verify.js'
export { WebhooksResource } from './webhooks/index.js'

export type {
  MavuntaEnvironment,
  MavuntaOptions,
  RequestOptions,
  ListResponse,
  SettlementCurrency,
  PaymentMethod,
  PaymentIntent,
  CreatePaymentIntentParams,
  PaymentLink,
  CreatePaymentLinkParams,
  Refund,
  Customer,
  CreateCustomerParams,
  Balance,
  Settlement,
  WebhookEndpoint,
  CreateWebhookEndpointParams,
  WebhookEvent,
  AuthVerifyResult,
} from './types.js'

export type { CreateQuoteParams } from './resources/quotes.js'
export type { CreateRefundParams } from './resources/refunds.js'
export type { ListPaymentIntentsParams } from './resources/payment-intents.js'
export type { ListCustomersParams } from './resources/customers.js'
export type { ListSettlementsParams } from './resources/settlements.js'
export type { ListWebhookEventsParams } from './resources/webhook-events.js'
export type { ReportParams } from './resources/reports.js'
export type { TriggerWebhookParams } from './resources/sandbox.js'
