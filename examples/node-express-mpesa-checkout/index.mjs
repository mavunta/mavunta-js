// Minimal Mavunta Pay checkout + webhook on Express.
//   node index.mjs   (needs MAVUNTA_SECRET_KEY and MAVUNTA_WEBHOOK_SECRET)
import express from 'express'
import Mavunta from 'mavunta'

const mavunta = new Mavunta({ secretKey: process.env.MAVUNTA_SECRET_KEY })
const app = express()

// 1) Create a payment intent and send the customer to hosted checkout.
app.post('/checkout', express.json(), async (req, res) => {
  const intent = await mavunta.paymentIntents.create({
    amount: String(req.body.amount ?? '2500'),
    currency: 'KES',
    settlement_currency: 'USDT',
    payment_methods: ['mpesa', 'card', 'paypal', 'mavunta_balance'],
    customer: { email: req.body.email, phone: req.body.phone },
    metadata: { orderId: req.body.orderId },
  })
  // checkoutUrl for a plain redirect; paymentIntentId for @mavunta/checkout-js
  // (see ../browser-checkout).
  res.json({ paymentIntentId: intent.id, checkoutUrl: intent.checkout_url })
})

// 2) Confirm the result with a signed webhook (raw body!).
app.post('/mavunta/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event
  try {
    event = mavunta.webhooks.verify({
      payload: req.body,
      signature: req.headers['mavunta-signature'],
      timestamp: req.headers['mavunta-timestamp'],
      secret: process.env.MAVUNTA_WEBHOOK_SECRET,
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
