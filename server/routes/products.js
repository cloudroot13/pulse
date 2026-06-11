import express from 'express'
import { openDb } from '../db.js'
import authenticate from '../middleware/authenticate.js'

const router = express.Router()

// list products stored in DB (data is JSON string)
router.get('/', async (req, res) => {
  const db = await openDb()
  const rows = await db.all('SELECT * FROM products')
  const products = rows.map(r => JSON.parse(r.data))
  res.json(products)
})

// upsert product (protected)
router.post('/', authenticate, async (req, res) => {
  const product = req.body
  if (!product || !product.id) return res.status(400).json({ error: 'Missing product id' })
  const db = await openDb()
  await db.run('INSERT OR REPLACE INTO products (id, data) VALUES (?, ?)', product.id, JSON.stringify(product))
  res.json({ ok: true })
})

// delete product
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params
  const db = await openDb()
  await db.run('DELETE FROM products WHERE id = ?', id)
  res.json({ ok: true })
})

export default router
