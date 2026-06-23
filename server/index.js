import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import config from './config.js'
import { openDb } from './db.js'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import paymentsRoutes from './routes/payments.js'
import webhooksRoutes from './routes/webhooks.js'
import bcrypt from 'bcryptjs'

// Load configuration from server/config.json when present (alternative to .env files)
// Do not overwrite existing process.env values if they are already set.
Object.keys(config || {}).forEach((key) => {
  if (!process.env[key]) process.env[key] = String(config[key])
})

const app = express()

// Security headers
app.use(helmet())

// Rate limiting - basic protection against brute force / abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX || 100), // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Configure CORS: prefer explicit allowed origins via env or config
const allowedOrigins = (process.env.ALLOWED_ORIGINS || config.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (!allowedOrigins.length) return callback(null, true) // no restriction configured
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS not allowed'), false)
  },
}))

app.use(express.json({ limit: '100kb' }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/webhooks', webhooksRoutes)
// Note: temporary server-side tokenization removed. Client-side tokenization
// should be performed using the Pagar.me public key (Vite env var VITE_PAGARME_PUBLIC_KEY).

const PORT = process.env.PORT || 4000

async function ensureAdmin() {
  const db = await openDb()
  const adminUser = process.env.ADMIN_USER || 'admin'
  const adminPass = process.env.ADMIN_PASS || 'T3mp!P@ssw0rd'
  const row = await db.get('SELECT * FROM users WHERE username = ?', adminUser)
  if (!row) {
    const hash = await bcrypt.hash(adminPass, 10)
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', adminUser, hash)
    console.log('Admin user created:', adminUser)
  }
}

ensureAdmin().then(() => {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))
})
