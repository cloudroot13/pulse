import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// Resolve config.json relative to this file (server/config.json)
const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = path.resolve(__dirname, 'config.json')
let config = {}
try {
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8')
    config = JSON.parse(raw)
  }
} catch (err) {
  console.warn('Failed to read server config.json', err)
}

export default config
