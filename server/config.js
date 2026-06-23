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

/*
  Deployment note: put your production keys and environment overrides in `server/config.json`
  OR set environment variables on the host. Example `server/config.json`:

  {
    "PAGARME_SECRET_KEY": "sk_sua_chave_de_producao",
    "PAGARME_PUBLIC_KEY": "pk_sua_chave_de_producao",
    "PAGARME_API_URL": "https://api.pagar.me/core/v5",
    "PAGARME_RETURN_URL": "https://seu-dominio.com/checkout/result",
    "PIX_EXPIRES_IN": 172800,
    "PORT": 4001
  }

  Important: do NOT commit `server/config.json` with real secrets. Use server env variables
  or place the `config.json` file and ensure it's excluded from git. On many hosts you can
  set env vars via the dashboard (preferred).
*/

export default config
