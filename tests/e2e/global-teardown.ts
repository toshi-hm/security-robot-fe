import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const PID_FILE = join(process.cwd(), 'tests', 'e2e', '.nuxt-dev.pid')

async function terminateProcessTree(pid: number) {
  try {
    // Attempt to terminate the entire process group. This works on POSIX
    // environments such as the GitHub Actions Ubuntu runners used in CI.
    process.kill(-pid, 'SIGTERM')
  } catch {
    try {
      process.kill(pid, 'SIGTERM')
    } catch (error) {
      if (process.env.DEBUG_E2E_BOOTSTRAP) {
        console.warn('Failed to terminate dev server gracefully:', error)
      }
    }
  }
}

export default async function globalTeardown() {
  try {
    const pidRaw = await readFile(PID_FILE, 'utf8')
    const pid = Number.parseInt(pidRaw, 10)

    if (!Number.isNaN(pid)) {
      await terminateProcessTree(pid)
    }
  } catch (error) {
    if (process.env.DEBUG_E2E_BOOTSTRAP) {
      console.warn('Skipping teardown cleanup:', (error as Error).message)
    }
  } finally {
    await rm(PID_FILE, { force: true }).catch(() => {})
  }
}
