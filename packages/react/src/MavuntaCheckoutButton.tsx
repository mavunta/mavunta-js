import type { ReactNode } from 'react'
import { useMavuntaCheckout } from './useMavuntaCheckout.js'

export interface MavuntaCheckoutButtonProps {
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
  /** Button label (default: "Pay with Mavunta"). */
  children?: ReactNode
}

/**
 * A button that sends the customer to Mavunta hosted checkout. Success is
 * confirmed server-side via webhooks after the redirect, so there is no
 * onSuccess here; use {@link useMavuntaPaymentStatus} for an inline status.
 */
export function MavuntaCheckoutButton({
  publicKey,
  paymentIntentId,
  baseUrl,
  onError,
  className,
  disabled,
  children,
}: MavuntaCheckoutButtonProps) {
  const { redirectToCheckout, loading } = useMavuntaCheckout(publicKey, baseUrl)

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
      {children ?? 'Pay with Mavunta'}
    </button>
  )
}
