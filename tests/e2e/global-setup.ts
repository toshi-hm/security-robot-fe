import { spawn } from 'node:child_process'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

import type { FullConfig } from '@playwright/test'

const PID_FILE = join(process.cwd(), 'tests', 'e2e', '.nuxt-dev.pid')
const DEFAULT_PORT = 3000
const DEFAULT_HOST = '127.0.0.1'

async function waitForServer(url: string, timeoutMs = 120_000) {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { method: 'GET' })
      if (response.ok) {
        return
      }
    } catch (error) {
      if (process.env.DEBUG_E2E_BOOTSTRAP) {
        console.warn('Waiting for dev server:', (error as Error).message)
      }
    }

    await delay(500)
  }

  throw new Error(`Timed out after ${timeoutMs}ms waiting for ${url}`)
}

export default async function globalSetup(_config: FullConfig) {
  const port = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? process.env.NUXT_PORT ?? `${DEFAULT_PORT}`, 10)
  const host = process.env.PLAYWRIGHT_HOST ?? DEFAULT_HOST
  const baseURL = process.env.BASE_URL ?? `http://${host}:${port}`

  process.env.BASE_URL = baseURL

  await mkdir(join(process.cwd(), 'test-results'), { recursive: true })

  const server = spawn('pnpm', ['dev', '--', '--port', String(port), '--hostname', host], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? 'development',
      PORT: String(port),
      NUXT_PORT: String(port),
      NITRO_PORT: String(port),
      HOST: host,
      NUXT_HOST: host,
      NITRO_HOST: host,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  })

  server.stdout?.on('data', (data: Buffer) => {
    process.stdout.write(`[nuxt] ${data}`)
  })

  server.stderr?.on('data', (data: Buffer) => {
    process.stderr.write(`[nuxt] ${data}`)
  })

  if (!server.pid) {
    throw new Error('Failed to start Nuxt dev server: PID was not assigned')
  }

  await waitForServer(`${baseURL}/`)

  await mkdir(join(process.cwd(), 'tests', 'e2e'), { recursive: true })
  await writeFile(PID_FILE, String(server.pid), 'utf8')

  // Detach the child process so Playwright can continue running tests while the
  // Nuxt dev server stays alive.
  server.unref()
}
