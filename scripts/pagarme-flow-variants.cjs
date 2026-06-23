#!/usr/bin/env node
/*
Runs multiple flow variants: create token, create card, try /orders with card_id, /charges, /payments, /checkout/sessions.
Usage: PAGARME_PUBLIC_KEY=pk_... PAGARME_SECRET_KEY=sk_... node scripts/pagarme-flow-variants.cjs
*/
const fs = require('fs')
const fetch = global.fetch || require('node-fetch')

const PAGARME_PUBLIC_KEY = process.env.PAGARME_PUBLIC_KEY
const PAGARME_SECRET_KEY = process.env.PAGARME_SECRET_KEY
const pagarmeUrl = process.env.PAGARME_API_URL || 'https://api.pagar.me/core/v5'

if (!PAGARME_PUBLIC_KEY || !PAGARME_SECRET_KEY) {
  console.error('PAGARME_PUBLIC_KEY and PAGARME_SECRET_KEY must be set')
  process.exit(1)
}

function genCPF(){
  const n = Array.from({length:9}, ()=>Math.floor(Math.random()*10))
  const d1 = ((n.reduce((s,x,i)=>s + x*(10-i),0))*10)%11 % 10
  const d2 = ((n.concat(d1).reduce((s,x,i)=>s + x*(11-i),0))*10)%11 % 10
  return n.join('') + String(d1) + String(d2)
}

async function createToken() {
  const body = {
    type: 'card',
    card: {
      number: '4111111111111111',
      holder_name: 'Cliente Teste',
      exp_month: 12,
      exp_year: 2028,
      cvv: '123'
    }
  }
  const res = await fetch(`${pagarmeUrl}/tokens?appId=${encodeURIComponent(PAGARME_PUBLIC_KEY)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const txt = await res.text()
  try { return JSON.parse(txt) } catch { throw new Error('token parse error: '+txt) }
}

async function createCard(secretKey, token) {
  const res = await fetch(`${pagarmeUrl}/cards`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(secretKey+':').toString('base64')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
  const raw = await res.text()
  try { return { ok: res.ok, status: res.status, data: JSON.parse(raw), raw } } catch { return { ok: res.ok, status: res.status, data: raw, raw } }
}

function basePayloadWithCard(cardId) {
  const cpf = genCPF()
  const amount = 100
  return {
    code: `test_${Date.now()}`,
    customer: {
      name: 'Cliente Teste',
      email: 'teste@example.com',
      document: cpf,
      type: cpf.replace(/\D/g,'').length > 11 ? 'company' : 'individual',
      phones: { mobile_phone: { country_code: '55', area_code: '11', number: '999999999' } },
      address: { street: 'Rua X', street_number: '1', complement: '', neighborhood: 'Centro', city: 'Sao Paulo', state: 'SP', zip_code: '01234567', country: 'BR' },
    },
    items: [{ amount: amount, description: 'Produto', quantity: 1, code: 't1' }],
    billing: { value: (amount/100).toFixed(2), amount: amount, currency: 'BRL' },
    payments: [{ payment_method: 'credit_card', amount: amount, credit_card: { card_id: cardId } }]
  }
}

async function tryEndpoint(secretKey, path, payload) {
  try {
    const res = await fetch(`${pagarmeUrl}${path}`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(secretKey+':').toString('base64')}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const raw = await res.text()
    let data
    try { data = raw ? JSON.parse(raw) : {} } catch { data = raw }
    return { ok: res.ok, status: res.status, data, raw }
  } catch (e) { return { error: String(e) } }
}

;(async ()=>{
  const out = { runs: [], timestamp: new Date().toISOString() }
  try {
    const tokenRes = await createToken()
    out.token = tokenRes
    const token = tokenRes.id || tokenRes.token || tokenRes.card?.id

    const cardRes = await createCard(PAGARME_SECRET_KEY, token)
    out.card = cardRes
    const cardId = cardRes.data?.id || cardRes.data?.card?.id

    if (!cardId) {
      out.error = 'no_card_id'
      fs.writeFileSync('/tmp/pagarme_flow_results.json', JSON.stringify(out, null, 2))
      console.log('No card id; results written to /tmp/pagarme_flow_results.json')
      return
    }

    // Try /orders with card_id
    const orderPayload = basePayloadWithCard(cardId)
    const rOrders = await tryEndpoint(PAGARME_SECRET_KEY, '/orders', orderPayload)
    out.rOrders = rOrders
    fs.writeFileSync('/tmp/pagarme_flow_orders.json', JSON.stringify({ payload: orderPayload, result: rOrders }, null, 2))

    // Try /charges (if supported)
    const chargesPayload = { amount: orderPayload.billing.amount, currency: 'BRL', card_id: cardId, billing: orderPayload.billing }
    const rCharges = await tryEndpoint(PAGARME_SECRET_KEY, '/charges', chargesPayload)
    out.rCharges = rCharges
    fs.writeFileSync('/tmp/pagarme_flow_charges.json', JSON.stringify({ payload: chargesPayload, result: rCharges }, null, 2))

    // Try /payments
    const paymentsPayload = { amount: orderPayload.billing.amount, payment_method: 'credit_card', credit_card: { card_id: cardId }, billing: orderPayload.billing, customer: orderPayload.customer }
    const rPayments = await tryEndpoint(PAGARME_SECRET_KEY, '/payments', paymentsPayload)
    out.rPayments = rPayments
    fs.writeFileSync('/tmp/pagarme_flow_payments.json', JSON.stringify({ payload: paymentsPayload, result: rPayments }, null, 2))

    // Try /checkout/sessions
    const checkoutPayload = { ...orderPayload, return_url: 'http://localhost:5173/checkout/result' }
    const rCheckout = await tryEndpoint(PAGARME_SECRET_KEY, '/checkout/sessions', checkoutPayload)
    out.rCheckout = rCheckout
    fs.writeFileSync('/tmp/pagarme_flow_checkout.json', JSON.stringify({ payload: checkoutPayload, result: rCheckout }, null, 2))

  } catch (e) {
    out.error = String(e)
  }
  fs.writeFileSync('/tmp/pagarme_flow_results.json', JSON.stringify(out, null, 2))
  console.log('Done. Results saved to /tmp/pagarme_flow_results.json and specific files.')
})()
