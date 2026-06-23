import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const run = promisify(execFile)
const BIN = fileURLToPath(new URL('../bin/coinwaka.mjs', import.meta.url))
const noKeyEnv = { ...process.env, COINWAKA_SECRET_KEY: '', COINWAKA_API_KEY: '' }

describe('coinwaka cli', () => {
  it('prints help', async () => {
    const { stdout } = await run('node', [BIN, 'help'])
    expect(stdout).toContain('Coinwaka Pay CLI')
    expect(stdout).toContain('listen --forward-to')
    expect(stdout).toContain('trigger')
  })

  it('prints the version', async () => {
    const { stdout } = await run('node', [BIN, 'version'])
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('errors (non-zero) on verify without a key', async () => {
    await expect(run('node', [BIN, 'verify'], { env: noKeyEnv })).rejects.toMatchObject({ code: 1 })
  })

  it('errors (non-zero) on an unknown command', async () => {
    await expect(run('node', [BIN, 'bogus'])).rejects.toMatchObject({ code: 1 })
  })

  it('errors (non-zero) on trigger without an event type', async () => {
    await expect(run('node', [BIN, 'trigger'])).rejects.toMatchObject({ code: 1 })
  })
})
