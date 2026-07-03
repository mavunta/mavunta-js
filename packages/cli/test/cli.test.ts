import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const run = promisify(execFile)
const BIN = fileURLToPath(new URL('../bin/mavunta.mjs', import.meta.url))
const noKeyEnv = { ...process.env, MAVUNTA_SECRET_KEY: '', MAVUNTA_API_KEY: '' }

describe('mavunta cli', () => {
  it('prints help', async () => {
    const { stdout } = await run('node', [BIN, 'help'])
    expect(stdout).toContain('Mavunta Pay CLI')
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
