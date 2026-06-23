// Minimal Coinwaka Pay checkout + webhook on Express.
//   node index.mjs   (needs COINWAKA_SECRET_KEY and COINWAKA_WEBHOOK_SECRET)
import express from 'express'
import { Coinwaka } from '@coinwaka/sdk'

const coinwaka = new Coinwaka({ secretKey: process.env.COINWAKA_SECRET_KEY })
const app = express()

// 1) Create a payment intent and send the customer to hosted checkout.
app.post('/checkout', express.json(), async (req, res) => {
  const intent = await coinwaka.paymentIntents.create({
    amount: String(req.body.amount ?? '2500'),
    currency: 'KES',
    settlement_currency: 'USDT',
    payment_methods: ['mpesa', 'card', 'paypal', 'coinwaka_balance'],
    customer: { email: req.body.email, phone: req.body.phone },
    metadata: { orderId: req.body.orderId },
  })
  res.json({ checkoutUrl: intent.checkout_url })
})

// 2) Confirm the result with a signed webhook (raw body!).
app.post('/coinwaka/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event
  try {
    event = coinwaka.webhooks.verify({
      payload: req.body,
      signature: req.headers['coinwaka-signature'],
      timestamp: req.headers['coinwaka-timestamp'],
      secret: process.env.COINWAKA_WEBHOOK_SECRET,
    })
  } catch {
    return res.sendStatus(400)
  }

  if (event.type === 'payment_intent.paid') {
    console.log('Paid order', event.data.metadata?.orderId)
    // fulfil the order idempotently here
  }
  res.sendStatus(200)
})

app.listen(3000, () => console.log('Listening on http://localhost:3000'))
