import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { openDb } from '../db.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' })

  const db = await openDb()
  const user = await db.get('SELECT * FROM users WHERE username = ?', username)

  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' })
  res.json({ token })
})

export default router
