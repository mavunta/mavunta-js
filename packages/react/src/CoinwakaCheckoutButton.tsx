import type { ReactNode } from 'react'
import { useCoinwakaCheckout } from './useCoinwakaCheckout.js'

export interface CoinwakaCheckoutButtonProps {
  /** Your publishable key (`cwk_…_pk_…`). */
  publicKey: string
  /** The payment intent your backend created (with a secret key). */
  paymentIntentId: string
  /** Override the API base URL. */
  baseUrl?: string
  /** Called if starting checkout fails (e.g. the intent is gone or expired). */
  onError?: (error: Error) => void
  className?: string
  disabled?: boolean
  /** Button label (default: "Pay with Coinwaka"). */
  children?: ReactNode
}

/**
 * A button that sends the customer to Coinwaka hosted checkout. Success is
 * confirmed server-side via webhooks after the redirect, so there is no
 * onSuccess here; use {@link useCoinwakaPaymentStatus} for an inline status.
 */
export function CoinwakaCheckoutButton({
  publicKey,
  paymentIntentId,
  baseUrl,
  onError,
  className,
  disabled,
  children,
}: CoinwakaCheckoutButtonProps) {
  const { redirectToCheckout, loading } = useCoinwakaCheckout(publicKey, baseUrl)

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || loading}
      onClick={() => {
        void redirectToCheckout(paymentIntentId).catch((err) => {
          onError?.(err instanceof Error ? err : new Error(String(err)))
        })
      }}
    >
      {children ?? 'Pay with Coinwaka'}
    </button>
  )
}
