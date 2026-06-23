#!/usr/bin/env node
import fs from 'fs'

// Simple local test runner for Pagar.me flows.
// Usage:
// PAGARME_SECRET_KEY=sk_xxx PORT=4001 node scripts/pagarme-test.js

const SK = process.env.PAGARME_SECRET_KEY
const PK = process.env.PAGARME_PUBLIC_KEY
const PORT = process.env.PORT || 4001
if (!SK) {
  console.error('Set PAGARME_SECRET_KEY in env before running this script')
  process.exit(1)
}
if (!PK) {
  console.error('Set PAGARME_PUBLIC_KEY in env before running this script')
  process.exit(1)
}

const pagarmeUrl = process.env.PAGARME_API_URL || 'https://api.pagar.me/core/v5'
const serverUrl = `http://localhost:${PORT}`

async function createTokenWithPublicKey() {
  const body = {
    card: {
      number: '4111111111111111',
      holder_name: 'Cliente Teste',
      exp_month: 12,
      exp_year: 2028,
      cvv: '123',
    },
  }

  const res = await fetch(`${pagarmeUrl}/tokens?appId=${encodeURIComponent(PK)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : {} } catch (e) { data = text }
  return { status: res.status, raw: text, json: data }
}

async function createOrder(cardToken) {
  const testAmount = Number(process.env.TEST_AMOUNT || 10)
  const payload = {
    total: testAmount,
    items: [{ id: 't1', name: 'Produto', unitPrice: testAmount, quantity: 1 }],
    customer: {
      name: 'Cliente Teste',
      email: 'teste@example.com',
      document: '12345678909',
      phone: '11999999999',
      address: { street: 'Rua X, 1', city: 'Sao Paulo', state: 'SP', zip: '01234567', country: 'BR' }
    },
    paymentMethod: 'credit_card',
    cardToken: cardToken,
  }

  const res = await fetch(`${serverUrl}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : {} } catch (e) { data = text }
  return { status: res.status, raw: text, json: data }
}

async function createOrderVariants(cardToken) {
  const testAmount = Number(process.env.TEST_AMOUNT || 10)
  const base = {
    total: testAmount,
    items: [{ id: 't1', name: 'Produto', unitPrice: testAmount, quantity: 1 }],
    customer: {
      name: 'Cliente Teste',
      email: 'teste@example.com',
      document: '12345678909',
      phone: '11999999999',
      address: { street: 'Rua X, 1', city: 'Sao Paulo', state: 'SP', zip: '01234567', country: 'BR' }
    },
    paymentMethod: 'credit_card',
  }

  const variants = [
    // Variant A: default payload (billing top-level + payments.billing string)
    {
      ...base,
      cardToken,
      billing: { value: '10.00', amount: 1000 },
      payments: [{ payment_method: 'credit_card', amount: 1000, billing: { value: '10.00', amount: 1000 }, credit_card: { card_token: cardToken, billing: { value: '10.00', amount: 1000 } } }]
    },
    // Variant B: no top-level billing, numeric values in payments
    {
      ...base,
      cardToken,
      payments: [{ payment_method: 'credit_card', amount: 1000, billing: { value: 10, amount: 1000 }, credit_card: { card_token: cardToken, billing: { value: 10, amount: 1000 } } }]
    },
    // Variant C: put billing.value under credit_card.transaction
    {
      ...base,
      cardToken,
      payments: [{ payment_method: 'credit_card', amount: 1000, credit_card: { card_token: cardToken, transaction: { billing: { value: '10.00', amount: 1000 } } } }]
    }
  ]

  const results = []
  for (let i = 0; i < variants.length; i++) {
    const payload = variants[i]
    const res = await fetch(`${serverUrl}/api/payments/create-order`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const text = await res.text()
    let data
    try { data = text ? JSON.parse(text) : {} } catch (e) { data = text }
    results.push({ variant: i + 1, status: res.status, raw: text, json: data })
  }
  return results
}

async function createOrderBrute(cardToken) {
  const testAmount = Number(process.env.TEST_AMOUNT || 10)
  const base = {
    total: testAmount,
    items: [{ id: 't1', name: 'Produto', unitPrice: testAmount, quantity: 1 }],
    customer: {
      name: 'Cliente Teste',
      email: 'teste@example.com',
      document: '12345678909',
      phone: '11999999999',
      address: { street: 'Rua X, 1', city: 'Sao Paulo', state: 'SP', zip: '01234567', country: 'BR' }
    },
    paymentMethod: 'credit_card',
  }

  const placements = [
    (p, t) => { p.billing = { value: t, amount: 1000 } },
    (p, t) => { p.payments = [{ payment_method: 'credit_card', amount: 1000, billing: { value: t, amount: 1000 }, credit_card: { card_token: p.cardToken, billing: { value: t, amount: 1000 } } }] },
    (p, t) => { p.payments = [{ payment_method: 'credit_card', amount: 1000, credit_card: { card_token: p.cardToken, transaction: { billing: { value: t, amount: 1000 } } } }] },
    (p, t) => { p.payments = [{ payment_method: 'credit_card', amount: 1000, credit_card: { card_token: p.cardToken, billing: { value: t, amount: 1000 }, transaction: { billing: { value: t, amount: 1000 } } } }] },
  ]

  const types = ['string', 'number']
  const results = []
  for (let i = 0; i < placements.length; i++) {
    for (let j = 0; j < types.length; j++) {
      // create fresh token for each attempt (tokens expire quickly)
      const newTokenRes = await createTokenWithPublicKey()
      const newToken = newTokenRes.json && (newTokenRes.json.id || newTokenRes.json.token)
      if (!newToken) {
        results.push({ placement: i + 1, type: types[j], status: 0, raw: 'failed to create token', json: {} })
        continue
      }
      const payload = { ...base, cardToken: newToken }
      const val = types[j] === 'string' ? (testAmount).toFixed(2) : Number((testAmount))
      placements[i](payload, val)
      // Also include duplicate everywhere for safety
      payload.payments = payload.payments || [{ payment_method: 'credit_card', amount: 1000, credit_card: { card_token: newToken } }]
      // ensure top-level billing present sometimes
      if (!payload.billing) payload.billing = { value: val, amount: 1000 }
      const res = await fetch(`${serverUrl}/api/payments/create-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const text = await res.text()
      let data
      try { data = text ? JSON.parse(text) : {} } catch (e) { data = text }
      results.push({ placement: i + 1, type: types[j], status: res.status, raw: text, json: data })
    }
  }
  return results
}

;(async function main(){
  console.log('Creating card token via Pagar.me (public key)...')
  const cardRes = await createTokenWithPublicKey()
  console.log('Token create status:', cardRes.status)
  console.log(cardRes.raw)

  const token = cardRes.json && (cardRes.json.id || cardRes.json.token)
  if (!token) {
    console.error('Card token not returned; aborting.');
    fs.writeFileSync('/tmp/pagarme_test_results.json', JSON.stringify({ cardRes }, null, 2))
    process.exit(1)
  }

  console.log('Using token:', token)
  console.log('Calling local server /api/payments/create-order with variants...')
  const variantResults = await createOrderVariants(token)
  variantResults.forEach((r) => {
    console.log(`Variant ${r.variant} => status: ${r.status}`)
    console.log(r.raw)
  })

  console.log('Now running brute-force placement tests...')
  const brute = await createOrderBrute(token)
  brute.forEach((r, idx) => {
    console.log(`Brute #${idx + 1} placement:${r.placement} type:${r.type} => status:${r.status}`)
    console.log(r.raw)
  })

  const out = { cardRes, variantResults, brute }
  try { fs.writeFileSync('/tmp/pagarme_test_results.json', JSON.stringify(out, null, 2)) } catch (e) {}
  console.log('Saved results to /tmp/pagarme_test_results.json')
})().catch((err)=>{ console.error(err); process.exit(1) })
