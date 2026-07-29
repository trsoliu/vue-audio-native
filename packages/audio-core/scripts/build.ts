import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { build as viteBuild } from 'vite'

const packageRoot = resolve(import.meta.dirname, '..')
const outputDirectory = resolve(packageRoot, 'dist')

await viteBuild({ configFile: resolve(packageRoot, 'vite.config.ts') })
await copyFile(
  resolve(outputDirectory, 'index.d.ts'),
  resolve(outputDirectory, 'index.d.cts'),
)
