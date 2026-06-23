# coinwaka

This package re-exports the official Coinwaka SDK.

Recommended installation:

```bash
npm install @coinwaka/sdk
```

This also works:

```bash
npm install coinwaka
```

```ts
import { Coinwaka } from 'coinwaka'

const coinwaka = new Coinwaka({ secretKey: process.env.COINWAKA_SECRET_KEY! })
```

See the full docs in [`@coinwaka/sdk`](https://www.npmjs.com/package/@coinwaka/sdk) and at https://developers.coinwaka.com.

Coinwaka is a product of Chainwaka Technologies. This package is not affiliated with CoinW or any similarly named exchange.

## License

MIT © Chainwaka Technologies
