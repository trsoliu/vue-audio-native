import { copyFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { build as viteBuild } from 'vite'

const packageRoot = resolve(import.meta.dirname, '..')
const outputDirectory = resolve(packageRoot, 'dist')
const configFile = resolve(packageRoot, 'vite.config.ts')

await viteBuild({ configFile, mode: 'library' })
await copyFile(
  resolve(outputDirectory, 'index.d.ts'),
  resolve(outputDirectory, 'index.d.cts'),
)
await writeFile(
  resolve(outputDirectory, 'style.css.d.ts'),
  'declare const stylesheet: string\nexport default stylesheet\n',
)
await viteBuild({ configFile, mode: 'global' })
