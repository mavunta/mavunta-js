# mavunta-js

The official Mavunta developer SDKs for JavaScript and TypeScript.

Mavunta is one API for payments, wallets, and crypto settlement: accept M-Pesa, Airtel Money, card, PayPal, and stablecoins; settle to USDT or USDC. Docs: https://developers.mavunta.com

| Package | What it is | Install |
| --- | --- | --- |
| [`mavunta`](https://www.npmjs.com/package/mavunta) | Server-side SDK (Node.js / TypeScript), full `/v1` surface | `npm install mavunta` |
| [`mavunta-cli`](https://www.npmjs.com/package/mavunta-cli) | CLI: verify keys, trigger sandbox events, forward webhooks (bin `mavunta`) | `npm install -g mavunta-cli` |
| [`@mavunta/checkout-js`](https://www.npmjs.com/package/@mavunta/checkout-js) | Browser checkout (publishable keys, hosted checkout redirect) | `npm install @mavunta/checkout-js` |
| [`@mavunta/react`](https://www.npmjs.com/package/@mavunta/react) | React bindings over checkout-js | `npm install @mavunta/react` |
| [`@mavunta/sdk`](https://www.npmjs.com/package/@mavunta/sdk) | Alias of `mavunta` (same library) | `npm install mavunta` |
| [`@mavunta/cli`](https://www.npmjs.com/package/@mavunta/cli) | Alias of `mavunta-cli` (same tool) | `npm install -g mavunta-cli` |

Sandbox keys (`cwk_test_…`) call `https://sandbox-api.mavunta.com/v1` and never move real money; live keys call `https://api.mavunta.com/v1`. The SDK and CLI pick the right host from the key prefix.

The legacy `@coinwaka/*` and `coinwaka` packages are deprecated; this family replaces them.

MIT © Chainwaka Technologies
