# @mavunta/cli

Command-line tools for **Mavunta Pay** — verify keys, fire sandbox webhook events, and forward live events to your local server for webhook testing.

## Use without installing

```bash
export MAVUNTA_SECRET_KEY=cwk_test_sk_…
npx @mavunta/cli verify
```

Or install globally:

```bash
npm install -g @mavunta/cli
mavunta --help
```

## Commands

```bash
# Verify your API key (no money moves)
mavunta verify

# Fire a sandbox webhook event
mavunta trigger payment_intent.paid

# Forward live sandbox events to your local server (the killer command for
# webhook development) — prints a signing secret and POSTs each new event
mavunta listen --forward-to http://localhost:3000/mavunta/webhook
mavunta listen --forward-to http://localhost:3000/webhook --events payment_intent.paid,refund.succeeded

# List recent events
mavunta events --limit 20
```

## Environment

| Variable | Purpose |
| --- | --- |
| `MAVUNTA_SECRET_KEY` | Your `cwk_test_…` / `cwk_live_…` key (required) |
| `MAVUNTA_BASE_URL` | Override the API base (default: `sandbox-api.mavunta.com/v1` for cwk_test_ keys, `api.mavunta.com/v1` for live) |

Webhooks forwarded by `listen` are signed exactly like production: `Mavunta-Signature` is HMAC-SHA256 (hex) over `` `${Mavunta-Timestamp}.${rawBody}` ``. Verify them with [`@mavunta/sdk`](https://www.npmjs.com/package/@mavunta/sdk)'s `webhooks.verify`.

## License

MIT © Chainwaka Technologies. Not affiliated with CoinW or any similarly named exchange.
