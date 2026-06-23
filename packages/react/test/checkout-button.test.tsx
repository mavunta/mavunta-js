import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

// Hoisted so the vi.mock factory (also hoisted) can reference it.
const { redirectToCheckout } = vi.hoisted(() => ({ redirectToCheckout: vi.fn() }))

vi.mock('@coinwaka/checkout-js', () => ({
  loadCoinwaka: vi.fn(async () => ({ redirectToCheckout, retrievePaymentIntent: vi.fn() })),
  CoinwakaCheckoutError: class extends Error {},
}))

import { CoinwakaCheckoutButton } from '../src/index.js'

beforeEach(() => {
  redirectToCheckout.mockReset()
  redirectToCheckout.mockResolvedValue(undefined)
})

describe('CoinwakaCheckoutButton', () => {
  it('renders the default label', () => {
    render(<CoinwakaCheckoutButton publicKey="cwk_test_pk_x" paymentIntentId="pi_1" />)
    expect(screen.getByRole('button').textContent).toBe('Pay with Coinwaka')
  })

  it('renders custom children', () => {
    render(
      <CoinwakaCheckoutButton publicKey="cwk_test_pk_x" paymentIntentId="pi_1">
        Buy now
      </CoinwakaCheckoutButton>,
    )
    expect(screen.getByRole('button').textContent).toBe('Buy now')
  })

  it('starts checkout with the intent id on click', async () => {
    render(<CoinwakaCheckoutButton publicKey="cwk_test_pk_x" paymentIntentId="pi_42" />)
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(redirectToCheckout).toHaveBeenCalledWith({ paymentIntentId: 'pi_42' }),
    )
  })

  it('calls onError when checkout fails', async () => {
    redirectToCheckout.mockRejectedValueOnce(new Error('boom'))
    const onError = vi.fn()
    render(
      <CoinwakaCheckoutButton publicKey="cwk_test_pk_x" paymentIntentId="pi_1" onError={onError} />,
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(onError).toHaveBeenCalled())
  })
})
