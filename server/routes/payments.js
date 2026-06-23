import express from 'express'
import config from '../config.js'
import fs from 'fs'

const router = express.Router()
const pagarmeUrl = process.env.PAGARME_API_URL || config.PAGARME_API_URL || 'https://api.pagar.me/core/v5'
const debugEnabled = process.env.PAGARME_DEBUG === 'true' || config.PAGARME_DEBUG === true

function toCents(value = 0) {
  return Math.round(Number(value || 0) * 100)
}

function onlyDigits(value = '') {
  return String(value || '').replace(/\D/g, '')
}

function writeDebugFile(name, data) {
  if (!debugEnabled) return
  try {
    fs.writeFileSync(`/tmp/${name}.json`, typeof data === 'string' ? data : JSON.stringify(data, null, 2))
  } catch {
    // Debug files are optional and disabled in production by default.
  }
}

function parseStreet(address = {}) {
  const rawStreet = address.street || address.line_1 || ''
  const [street, ...numberParts] = String(rawStreet).split(',')
  return {
    street: address.street_name || street.trim() || 'Endereco',
    streetNumber: address.street_number || numberParts.join(',').trim() || 'S/N',
  }
}

function formatAddress(address = {}) {
  const parsed = parseStreet(address)
  return {
    street: parsed.street,
    street_number: parsed.streetNumber,
    complement: address.complement || '',
    neighborhood: address.neighborhood || 'Centro',
    city: address.city || '',
    state: String(address.state || '').toUpperCase().slice(0, 2),
    zip_code: onlyDigits(address.zip || address.zip_code),
    country: address.country || 'BR',
  }
}

function formatPhone(phone = '') {
  const digits = onlyDigits(phone)
  return {
    country_code: '55',
    area_code: digits.slice(0, 2) || '11',
    number: digits.slice(2) || '999999999',
  }
}

function getDocument(order = {}) {
  return onlyDigits(order.customer?.document || order.customer?.billing?.cpf || order.customer?.cpf || order.customer?.cpf_cnpj)
}

function buildBilling(order = {}) {
  const amount = toCents(order.total || order.amount)
  const address = formatAddress(order.customer?.address || {})
  const valueNumber = Number((amount / 100).toFixed(2))
  return {
    // human-friendly numeric value (e.g. 10.00) and machine-friendly cents amount (1000)
    value: valueNumber,
    amount,
    currency: 'BRL',
    name: order.customer?.name || '',
    email: order.customer?.email || '',
    document: getDocument(order),
    phone: formatPhone(order.customer?.phone || order.customer?.address?.phone),
    birthdate: order.customer?.birthdate || order.customer?.birth_date || undefined,
    ...address,
  }
}

function buildCustomer(order = {}) {
  const document = getDocument(order)
  const phone = order.customer?.phone || order.customer?.address?.phone
  return {
    name: order.customer?.name || '',
    email: order.customer?.email || '',
    document,
    type: document.length > 11 ? 'company' : 'individual',
    phones: { mobile_phone: formatPhone(phone) },
    address: formatAddress(order.customer?.address || {}),
    // V5 expects billing address under `customer.billing` for some validations
    billing: (function () {
      const addr = formatAddress(order.customer?.address || {})
      const line1 = `${addr.street}${addr.street_number ? ', ' + addr.street_number : ''}`.trim()
      return {
        line_1: line1 || '',
        line_2: addr.complement || '',
        zip_code: addr.zip_code || '',
        city: addr.city || '',
        state: addr.state || '',
        country: addr.country || 'BR',
      }
    })(),
    birthdate: order.customer?.birthdate || order.customer?.birth_date || undefined,
  }
}

function buildItems(items = []) {
  return items.map((item) => ({
    amount: toCents(item.unitPrice ?? item.price ?? item.amount ?? 0),
    description: item.name || item.description || 'Produto Pulsepro',
    quantity: Number(item.quantity || 1),
    code: item.id || item.code || item.name || 'produto',
  }))
}

function buildPagarmePayload(order = {}) {
  const amount = toCents(order.total || order.amount)
  const billing = buildBilling(order)
  // Ensure billing.value is a string with two decimals (defensive)
  billing.value = Number((amount / 100).toFixed(2))
  const paymentMethod = order.paymentMethod === 'card' ? 'credit_card' : order.paymentMethod || 'pix'
  const payment = {
    payment_method: paymentMethod,
    amount,
    billing: { ...billing },
  }

  if (paymentMethod === 'credit_card') {
    payment.credit_card = {
      recurrence: false,
      installments: Number(order.installments || 1),
      statement_descriptor: 'PULSEPRO',
      billing: { ...billing },
    }
    if (order.cardToken) payment.credit_card.card_token = order.cardToken
    if (order.cardId) payment.credit_card.card_id = order.cardId
    // Provide explicit billing_address for acquirers that validate this path
    payment.credit_card.billing_address = {
      name: billing.name,
      email: billing.email,
      document: billing.document,
      street: billing.street,
      street_number: billing.street_number || billing.streetNumber || billing.streetNumber,
      complement: billing.complement,
      neighborhood: billing.neighborhood,
      city: billing.city,
      state: billing.state,
      zip_code: billing.zip_code,
      country: billing.country,
      phone: billing.phone,
      birthdate: billing.birthdate,
    }
    // Some acquirers validate billing information nested under transaction or additional keys.
    // Duplicate billing under a transaction object to increase chance the acquirer finds it.
    // Duplicate billing under transaction explicitly (defensive copy)
    payment.credit_card.transaction = { billing: { ...billing } }
  }

  if (paymentMethod === 'pix') {
    payment.pix = order.pix || {
      expires_in: Number(process.env.PIX_EXPIRES_IN || config.PIX_EXPIRES_IN || 172800),
    }
  }

  if (paymentMethod === 'boleto') {
    payment.boleto = order.boleto || {}
  }

  return {
    code: order.code || order.id || `order_${Date.now()}`,
    customer: buildCustomer(order),
    items: buildItems(order.items || []),
    billing: { ...billing },
    payments: [payment],
  }
}

function collectErrors(data) {
  const errors = []

  if (!data) return errors
  if (typeof data === 'string') return [data]
  if (data.message) errors.push(String(data.message))
  if (Array.isArray(data.errors)) {
    data.errors.forEach((error) => {
      if (typeof error === 'string') errors.push(error)
      else if (error?.message) errors.push(error.message)
      else errors.push(JSON.stringify(error))
    })
  }
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    Object.entries(data.errors).forEach(([field, value]) => {
      errors.push(`${field}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
    })
  }
  if (Array.isArray(data.charges)) {
    data.charges.forEach((charge) => {
      if (charge.status === 'failed' && charge.last_transaction?.gateway_response?.errors) {
        charge.last_transaction.gateway_response.errors.forEach((error) => {
          errors.push([error.code, error.parameter_name, error.message].filter(Boolean).join(' | '))
        })
      }
      if (charge.last_transaction?.acquirer_message) errors.push(charge.last_transaction.acquirer_message)
    })
  }

  return Array.from(new Set(errors.filter(Boolean)))
}

function isApproved(data) {
  if (!data || typeof data !== 'object') return false
  const chargeApproved = Array.isArray(data.charges) && data.charges.some((charge) => ['paid', 'captured', 'authorized'].includes(charge.status) || ['paid', 'captured', 'authorized'].includes(charge.last_transaction?.status))
  return ['paid', 'captured', 'authorized'].includes(data.status) || chargeApproved
}

function envelope(data, responseOk = true) {
  const errors = collectErrors(data)
  return {
    success: Boolean(responseOk && !errors.length),
    approved: isApproved(data),
    errors,
    data,
  }
}

async function pagarmeRequest(secretKey, path, payload, debugName) {
  writeDebugFile(`${debugName}_payload`, payload)
  const response = await fetch(`${pagarmeUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const raw = await response.text()
  let data
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch {
    data = raw
  }
  writeDebugFile(`${debugName}_response`, data || { status: response.status })

  // Terminal logging required: payload, HTTP status and full body
  try {
    console.log('Pagar.me request:', { path, payload })
    console.log('Pagar.me response status:', response.status)
    console.log('Pagar.me response body:', data)
  } catch (e) {
    // swallow logging errors
  }

  return { response, data, raw }
}

async function createCardResource(secretKey, cardToken) {
  const result = await pagarmeRequest(secretKey, '/cards', { token: cardToken }, 'pagarme_card_create')
  return {
    ok: result.response.ok,
    status: result.response.status,
    data: result.data,
  }
}

function shouldRetryWithCardId(order, result) {
  const raw = String(result.raw || JSON.stringify(result.data || ''))
  return Boolean(order.cardToken && raw.toLowerCase().includes('token'))
}

router.post('/create-order', async (req, res) => {
  const secretKey = process.env.PAGARME_SECRET_KEY || config.PAGARME_SECRET_KEY
  const order = req.body

  // Basic server-side validation to avoid accepting clearly invalid inputs
  const serverErrors = []
  if (!order) serverErrors.push('empty_order')
  if (!order.customer || !order.customer.email || !/\S+@\S+\.\S+/.test(order.customer.email)) serverErrors.push('invalid_customer_email')
  const doc = getDocument(order)
  if (!doc || doc.length < 11) serverErrors.push('invalid_customer_document')
  const amount = Number(order.total || order.amount || (order.items && order.items[0] && order.items[0].amount) || 0)
  if (!amount || amount <= 0) serverErrors.push('invalid_amount')
  if (serverErrors.length) {
    return res.status(400).json(envelope({ message: 'Invalid order payload', errors: serverErrors }, false))
  }

  if (!secretKey || secretKey.includes('coloque_sua_chave')) {
    return res.json(envelope({
      provider: 'mock',
      id: `mock_${Date.now()}`,
      status: 'pending',
      message: 'Configure PAGARME_SECRET_KEY no servidor para criar pedido real.',
    }))
  }

  // Deprecated: tokenization/card creation flow removed in favour of Hosted Checkout.
  return res.status(410).json(envelope({ message: 'Server no longer supports token/card flow. Use hosted checkout via /create-hosted-checkout.' }, false))
})

router.post('/create-hosted-checkout', async (req, res) => {
  const secretKey = process.env.PAGARME_SECRET_KEY || config.PAGARME_SECRET_KEY

  if (!secretKey || secretKey.includes('coloque_sua_chave')) {
    return res.status(400).json(envelope({ message: 'PAGARME_SECRET_KEY not configured on server' }, false))
  }

  const order = req.body
  const basePayload = buildPagarmePayload(order)
  const payload = {
    ...basePayload,
    return_url: order.return_url || process.env.PAGARME_RETURN_URL || config.PAGARME_RETURN_URL || 'http://localhost:5173/checkout/result',
  }

  try {
    // Call Pagar.me to create hosted checkout session
    const result = await pagarmeRequest(secretKey, '/checkout/sessions', payload, 'pagarme_checkout')

    // Terminal logs are already emitted by pagarmeRequest. Ensure client receives only the checkout URL.
    if (!result.response.ok) {
      // Forward error with full body for client debugging
      return res.status(result.response.status).json(envelope(result.data, false))
    }

    const url = result.data?.url || result.data?.checkout_url || result.data?.redirect_url || result.data?.redirect?.url
    return res.json({ checkoutUrl: url })
  } catch (error) {
    return res.status(500).json(envelope({ message: 'Failed to create hosted checkout session', detail: error?.message || String(error) }, false))
  }
})

export default router
