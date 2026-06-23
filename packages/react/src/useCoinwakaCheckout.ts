import { useCallback, useRef, useState } from 'react'
import { loadCoinwaka, type CoinwakaCheckout, type PaymentIntentView } from '@coinwaka/checkout-js'

export interface UseCoinwakaCheckout {
  /** Read the public view of a payment intent. */
  retrievePaymentIntent: (id: string) => Promise<PaymentIntentView>
  /** Send the customer to hosted checkout for an existing intent. */
  redirectToCheckout: (paymentIntentId: string) => Promise<void>
  /** True while a redirect is in flight. */
  loading: boolean
  /** The last error, if any. */
  error: Error | null
}

/**
 * Browser checkout for React. Loads a publishable-key client once and exposes
 * redirect + retrieve helpers with loading/error state.
 */
export function useCoinwakaCheckout(publicKey: string, baseUrl?: string): UseCoinwakaCheckout {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const clientRef = useRef<{ key: string; base?: string; promise: Promise<CoinwakaCheckout> } | null>(null)

  const getClient = useCallback((): Promise<CoinwakaCheckout> => {
    const cached = clientRef.current
    if (cached && cached.key === publicKey && cached.base === baseUrl) return cached.promise
    const promise = loadCoinwaka(publicKey, { baseUrl })
    clientRef.current = { key: publicKey, base: baseUrl, promise }
    return promise
  }, [publicKey, baseUrl])

  const retrievePaymentIntent = useCallback(
    async (id: string): Promise<PaymentIntentView> => {
      const client = await getClient()
      return client.retrievePaymentIntent(id)
    },
    [getClient],
  )

  const redirectToCheckout = useCallback(
    async (paymentIntentId: string): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const client = await getClient()
        await client.redirectToCheckout({ paymentIntentId })
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        setLoading(false)
        throw e
      }
    },
    [getClient],
  )

  return { retrievePaymentIntent, redirectToCheckout, loading, error }
}
