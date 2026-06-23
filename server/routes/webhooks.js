import express from 'express'

const router = express.Router()

// Simple endpoint to receive payment provider webhooks (Pagar.me)
router.post('/pagarme', express.json(), (req, res) => {
  // Log the incoming webhook for debugging. In production, validate signature.
  console.log('Pagar.me webhook received:', JSON.stringify(req.body))
  // TODO: validate signature using provider docs, then handle event types (payment.paid, payment.failed, etc.)
  res.status(200).json({ received: true })
})

export default router
