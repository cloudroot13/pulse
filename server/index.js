import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { openDb } from './db.js'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import bcrypt from 'bcryptjs'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)

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
