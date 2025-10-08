import { Buffer } from 'node:buffer'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import type { TestInfo } from '@playwright/test'

export async function ensureSnapshotBaseline(testInfo: TestInfo, fileName: string, base64: string) {
  const snapshotPath = testInfo.snapshotPath(fileName)
  await mkdir(dirname(snapshotPath), { recursive: true })

  try {
    await access(snapshotPath)
  } catch {
    const buffer = Buffer.from(base64, 'base64')
    await writeFile(snapshotPath, buffer)
  }

  return snapshotPath
}
