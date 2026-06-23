/**
 * @coinwaka/sdk — Official TypeScript and JavaScript SDK for the Coinwaka API.
 *
 * Server-side only. Build Coinwaka Pay: M-Pesa, card, PayPal, Coinwaka Balance,
 * and crypto payments with USDT/USDC/BTC/ETH/SOL settlement, payment links,
 * and signed webhooks.
 *
 * ```ts
 * import { Coinwaka } from '@coinwaka/sdk'
 *
 * const coinwaka = new Coinwaka({ secretKey: process.env.COINWAKA_SECRET_KEY! })
 *
 * const intent = await coinwaka.paymentIntents.create({
 *   amount: '2500',
 *   currency: 'KES',
 *   settlement_currency: 'USDT',
 *   payment_methods: ['mpesa', 'card', 'paypal', 'coinwaka_balance'],
 * })
 * // → redirect the customer to intent.checkout_url
 * ```
 *
 * Coinwaka is a product of Chainwaka Technologies. This package is not
 * affiliated with CoinW or any similarly named exchange.
 */

export { Coinwaka } from './client.js'
export { Coinwaka as default } from './client.js'

export {
  CoinwakaError,
  CoinwakaAPIError,
  CoinwakaAuthenticationError,
  CoinwakaPermissionError,
  CoinwakaValidationError,
  CoinwakaIdempotencyError,
  CoinwakaRateLimitError,
  CoinwakaConnectionError,
  CoinwakaTimeoutError,
  CoinwakaWebhookSignatureError,
} from './errors.js'
export type { CoinwakaErrorBody } from './errors.js'

export { verifyWebhook } from './webhooks/verify.js'
export type { VerifyWebhookParams } from './webhooks/verify.js'
export { WebhooksResource } from './webhooks/index.js'

export type {
  CoinwakaEnvironment,
  CoinwakaOptions,
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
