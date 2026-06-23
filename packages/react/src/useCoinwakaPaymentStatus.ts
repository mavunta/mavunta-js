import { useEffect, useState } from 'react'
import { loadCoinwaka, type PaymentIntentView } from '@coinwaka/checkout-js'

export interface UseCoinwakaPaymentStatus {
  intent: PaymentIntentView | null
  status: string | null
  error: Error | null
}

/**
 * Poll a payment intent's status while `paymentIntentId` is set, updating on
 * each change and stopping at a terminal status. Useful for an inline "waiting
 * for payment" view after redirecting away and back, or for a polled receipt.
 */
export function useCoinwakaPaymentStatus(
  publicKey: string,
  paymentIntentId: string | null,
  options: { baseUrl?: string; intervalMs?: number } = {},
): UseCoinwakaPaymentStatus {
  const [intent, setIntent] = useState<PaymentIntentView | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const { baseUrl, intervalMs } = options

  useEffect(() => {
    if (!paymentIntentId) return
    let active = true
    let stop: () => void = () => {}
    loadCoinwaka(publicKey, { baseUrl })
      .then((client) => {
        if (!active) return
        stop = client.onStatus(paymentIntentId, (next) => setIntent(next), { intervalMs })
      })
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
    return () => {
      active = false
      stop()
    }
  }, [publicKey, paymentIntentId, baseUrl, intervalMs])

  return { intent, status: intent?.status ?? null, error }
}
