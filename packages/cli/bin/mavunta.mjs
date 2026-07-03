#!/usr/bin/env node
// mavunta — command-line tools for the Mavunta Pay API. Zero dependencies
// (Node 18+ global fetch + node:crypto). Its standout command is `listen`,
// which forwards live sandbox events to your local server for webhook testing.
import { createHmac, randomBytes } from 'node:crypto'

const VERSION = '1.0.0'
const BASE = (process.env.MAVUNTA_BASE_URL || 'https://api.mavunta.com/v1').replace(/\/$/, '')
const KEY = process.env.MAVUNTA_SECRET_KEY || process.env.MAVUNTA_API_KEY || ''

const HELP = `mavunta — Mavunta Pay CLI (v${VERSION})

Usage:
  mavunta verify                          Verify your API key (no money moves)
  mavunta trigger <event>                 Fire a sandbox webhook event
                                           e.g. mavunta trigger payment_intent.paid
  mavunta listen --forward-to <url>       Forward live sandbox events to a local URL
                  [--events a,b]           optional comma-separated type filter
  mavunta events [--limit N]              Show recent events
  mavunta version                         Print the CLI version

Environment:
  MAVUNTA_SECRET_KEY   your cwk_test_… / cwk_live_… key (required)
  MAVUNTA_BASE_URL     override the API base (default https://api.mavunta.com/v1)`

function die(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

function parseFlags(args) {
  const out = { _: [] }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = args[i + 1]
      out[key] = next && !next.startsWith('--') ? args[++i] : 'true'
    } else {
      out._.push(a)
    }
  }
  return out
}

function buildUrl(path, query) {
  let url = BASE + path
  if (query) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) if (v != null) p.set(k, String(v))
    const s = p.toString()
    if (s) url += '?' + s
  }
  return url
}

// fatal=true: print and exit on error (one-shot commands). fatal=false: return
// null on error (the long-running listen loop must survive transient failures).
async function request(method, path, { body, query, fatal = true } = {}) {
  if (!KEY) die('Set MAVUNTA_SECRET_KEY to a cwk_test_… or cwk_live_… key.')
  try {
    const res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': `mavunta-cli/${VERSION}`,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    const json = text ? JSON.parse(text) : {}
    if (!res.ok) {
      if (!fatal) return null
      die(`Error ${res.status}: ${json?.error?.code ?? ''} ${json?.error?.message ?? text}`.trim())
    }
    return json
  } catch (err) {
    if (!fatal) return null
    die(`Request failed: ${err?.message ?? err}`)
  }
}

async function cmdVerify() {
  const r = await request('GET', '/auth/verify')
  console.log(`${r.livemode ? 'LIVE' : 'sandbox'} key for merchant ${r.merchant_id}`)
  console.log(`scopes: ${(r.scopes ?? []).join(', ')}`)
}

async function cmdTrigger(flags) {
  const type = flags._[0]
  if (!type) die('Usage: mavunta trigger <event>   e.g. mavunta trigger payment_intent.paid')
  await request('POST', '/sandbox/webhooks/trigger', { body: { type } })
  console.log(`Triggered ${type}.`)
}

async function cmdEvents(flags) {
  const r = await request('GET', '/events', { query: { limit: flags.limit ?? 20 } })
  if (!r.data?.length) return console.log('No events yet.')
  for (const e of r.data) console.log(`${e.created_at}  ${e.id}  ${e.type}`)
}

async function cmdListen(flags) {
  const url = flags['forward-to']
  if (!url) die('Usage: mavunta listen --forward-to http://localhost:3000/webhook')
  const filter = flags.events ? new Set(String(flags.events).split(',').map((s) => s.trim())) : null
  const secret = `whsec_cli_${randomBytes(16).toString('hex')}`
  console.log(`Ready! Forwarding sandbox events to ${url}`)
  console.log(`Your webhook signing secret is ${secret}`)
  console.log('Verify with HMAC-SHA256 over `${Mavunta-Timestamp}.${rawBody}`.\n')

  // Seed the cursor at the latest event so only NEW events are forwarded.
  const seed = await request('GET', '/events', { query: { limit: 1 } })
  let cursor = seed?.data?.[0]?.id ?? null

  for (;;) {
    const r = cursor
      ? await request('GET', '/events', { query: { after: cursor, limit: 50 }, fatal: false })
      : await request('GET', '/events', { query: { limit: 1 }, fatal: false })
    if (r?.data?.length) {
      if (cursor) {
        for (const e of r.data) {
          cursor = e.id
          if (filter && !filter.has(e.type)) continue
          const body = JSON.stringify(e)
          const ts = Math.floor(Date.now() / 1000).toString()
          const sig = createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex')
          let status = 'ERR'
          try {
            const resp = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Mavunta-Signature': sig,
                'Mavunta-Timestamp': ts,
                'Mavunta-Event-Id': e.id,
              },
              body,
            })
            status = String(resp.status)
          } catch (err) {
            status = err?.message ?? 'ERR'
          }
          console.log(`${e.type}  ->  ${url}  [${status}]`)
        }
      } else {
        cursor = r.data[0].id // establish the starting point, forward nothing
      }
    }
    await new Promise((res) => setTimeout(res, 2000))
  }
}

async function main() {
  const [, , cmd, ...rest] = process.argv
  const flags = parseFlags(rest)
  if (!cmd || cmd === 'help' || flags.help) return console.log(HELP)
  if (cmd === 'version' || flags.version) return console.log(VERSION)
  if (cmd === 'verify') return cmdVerify()
  if (cmd === 'trigger') return cmdTrigger(flags)
  if (cmd === 'events') return cmdEvents(flags)
  if (cmd === 'listen') return cmdListen(flags)
  die(`Unknown command: ${cmd}\n\n${HELP}`)
}

main().catch((e) => die(String(e?.message ?? e)))
