# @coinwaka/cli

Command-line tools for **Coinwaka Pay** — verify keys, fire sandbox webhook events, and forward live events to your local server for webhook testing.

## Use without installing

```bash
export COINWAKA_SECRET_KEY=cwk_test_sk_…
npx @coinwaka/cli verify
```

Or install globally:

```bash
npm install -g @coinwaka/cli
coinwaka --help
```

## Commands

```bash
# Verify your API key (no money moves)
coinwaka verify

# Fire a sandbox webhook event
coinwaka trigger payment_intent.paid

# Forward live sandbox events to your local server (the killer command for
# webhook development) — prints a signing secret and POSTs each new event
coinwaka listen --forward-to http://localhost:3000/coinwaka/webhook
coinwaka listen --forward-to http://localhost:3000/webhook --events payment_intent.paid,refund.succeeded

# List recent events
coinwaka events --limit 20
```

## Environment

| Variable | Purpose |
| --- | --- |
| `COINWAKA_SECRET_KEY` | Your `cwk_test_…` / `cwk_live_…` key (required) |
| `COINWAKA_BASE_URL` | Override the API base (default `https://api.coinwaka.com/v1`) |

Webhooks forwarded by `listen` are signed exactly like production: `Coinwaka-Signature` is HMAC-SHA256 (hex) over `` `${Coinwaka-Timestamp}.${rawBody}` ``. Verify them with [`@coinwaka/sdk`](https://www.npmjs.com/package/@coinwaka/sdk)'s `webhooks.verify`.

## License

MIT © Chainwaka Technologies. Not affiliated with CoinW or any similarly named exchange.
