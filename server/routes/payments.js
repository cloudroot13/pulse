import express from 'express'
import config from '../config.js'

const router = express.Router()

const pagarmeUrl = process.env.PAGARME_API_URL || 'https://api.pagar.me/core/v5'

function toCents(value = 0) {
  return Math.round(Number(value) * 100)
}

function buildPagarmePayload(order) {
  return {
    customer: {
      name: order.customer?.name,
      email: order.customer?.email,
      // Map document if provided (CPF/CNPJ)
      document: order.customer?.document || order.customer?.cpf || order.customer?.cpf_cnpj,
      // Provide customer type when document is present (basic heuristic)
      type: order.customer?.type || (order.customer?.document || order.customer?.cpf || order.customer?.cpf_cnpj ? (String(order.customer?.document || order.customer?.cpf || order.customer?.cpf_cnpj).replace(/\D/g, '').length <= 11 ? 'individual' : 'company') : undefined),
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: String(order.customer?.phone || '').replace(/\D/g, '').slice(0, 2) || '61',
          number: String(order.customer?.phone || '').replace(/\D/g, '').slice(2) || '999999999',
        },
      },
    },
    items: (order.items || []).map((item) => ({
      amount: toCents(item.unitPrice ?? item.price ?? 0),
      description: item.name,
      quantity: item.quantity,
      code: item.id || item.name,
    })),
    payments: [
      {
        payment_method: order.paymentMethod === 'boleto' ? 'boleto' : order.paymentMethod,
        amount: toCents(order.total),
        ...(order.paymentMethod === 'credit_card' && order.cardToken
          ? {
              credit_card: {
                recurrence: false,
                installments: order.installments || 1,
                statement_descriptor: 'PULSEPRO',
                card_token: order.cardToken,
              },
            }
          : {}),
        // Provide a boleto object (even empty) to satisfy basic API validation
        ...(order.paymentMethod === 'boleto' ? { boleto: order.boleto || {} } : {}),
      },
    ],
  }
}

router.post('/create-order', async (req, res) => {
  const secretKey = process.env.PAGARME_SECRET_KEY || config.PAGARME_SECRET_KEY
  const order = req.body

  if (!secretKey || secretKey.includes('coloque_sua_chave')) {
    return res.json({
      provider: 'mock',
      id: `mock_${Date.now()}`,
      status: 'pending',
      message: 'Configure PAGARME_SECRET_KEY no servidor para criar pedido real.',
    })
  }

  try {
    const response = await fetch(`${pagarmeUrl}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildPagarmePayload(order)),
    })

    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    return res.json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Pagar.me request failed' })
  }
})

export default router
