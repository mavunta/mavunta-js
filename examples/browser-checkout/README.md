# Browser checkout (zero build)

A single static HTML page that starts Coinwaka hosted checkout from the browser using the [`@coinwaka/checkout-js`](../../packages/checkout-js) CDN global. No bundler, no install.

## Run

1. Start the backend that creates payment intents: see [`../node-express-mpesa-checkout`](../node-express-mpesa-checkout) (it must return `{ paymentIntentId }` and allow CORS from this page's origin).
2. Edit `index.html`: set `PUBLIC_KEY` to your `cwk_test_pk_…` publishable key.
3. Serve this folder (any static server):

   ```bash
   npm start          # uses `npx serve`
   # or: python -m http.server 5500
   ```

4. Open the page and click **Pay with Coinwaka**.

## How it works

- The **secret** key stays on your server, which creates the payment intent.
- The browser uses only your **publishable** key (`cwk_test_pk_…`) and the intent id to redirect to hosted checkout.
- Payment success is confirmed server-side via a signed webhook — never trust the browser redirect alone.

Pin a version in production: `https://unpkg.com/@coinwaka/checkout-js@1.0.0`.
