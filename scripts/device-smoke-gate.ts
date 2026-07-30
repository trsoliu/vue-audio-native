import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const requiredDeviceEnvironments = [
  'iOS 15.6+ WKWebView',
  'Android 8+ WebView 96+',
  'HarmonyOS 3/4 WebView',
  'HarmonyOS NEXT ArkWeb',
] as const

function tableRows(markdown: string): Map<string, string> {
  const rows = new Map<string, string>()

  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())
    if (cells.length < 3) continue
    const environment = cells[0]
    const status = cells.at(-1)
    if (environment && status) rows.set(environment, status)
  }

  return rows
}

export function evaluateDeviceSmoke(markdown: string): string[] {
  const rows = tableRows(markdown)
  return requiredDeviceEnvironments.filter(
    (environment) => rows.get(environment) !== '通过',
  )
}

export async function verifyDeviceSmoke(
  filePath = 'docs/device-smoke.md',
): Promise<void> {
  const absolutePath = resolve(process.cwd(), filePath)
  const blocked = evaluateDeviceSmoke(await readFile(absolutePath, 'utf8'))
  if (blocked.length > 0) {
    throw new Error(
      `Stable release blocked by device-smoke evidence: ${blocked.join(', ')}`,
    )
  }
  console.log(
    'Stable release device-smoke gate passed for all required environments.',
  )
}

const invokedModule = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : ''
if (import.meta.url === invokedModule) {
  void verifyDeviceSmoke(process.argv[2]).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
