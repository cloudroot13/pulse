#!/usr/bin/env node
/*
Test deeper billing nesting and alternative endpoints (/orders, /payments, /charges).
Usage: PAGARME_PUBLIC_KEY=pk_... PAGARME_SECRET_KEY=sk_... node scripts/pagarme-billing-deep-variants.cjs
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
    card: { number: '4111111111111111', holder_name: 'Cliente Teste', exp_month: 12, exp_year: 2028, cvv: '123' }
  }
  const res = await fetch(`${pagarmeUrl}/tokens?appId=${encodeURIComponent(PAGARME_PUBLIC_KEY)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const txt = await res.text()
  try { return JSON.parse(txt) } catch { throw new Error('token parse error: '+txt) }
}

function basePayload(token) {
  const cpf = genCPF()
  const amount = 100
  return {
    code: `test_${Date.now()}`,
    customer: {
      name: 'Cliente Teste', email: 'teste@example.com', document: cpf, type: 'individual',
      phones: { mobile_phone: { country_code: '55', area_code: '11', number: '999999999' } },
      address: { street: 'Rua X', street_number: '1', complement: '', neighborhood: 'Centro', city: 'Sao Paulo', state: 'SP', zip_code: '01234567', country: 'BR' },
    },
    items: [{ amount: amount, description: 'Produto', quantity: 1, code: 't1' }],
    billing: { value: (amount/100).toFixed(2), amount: amount, currency: 'BRL' },
    payments: [{ payment_method: 'credit_card', amount: amount, credit_card: { card_token: token } }]
  }
}

async function tryOrder(secretKey, payload) {
  const res = await fetch(`${pagarmeUrl}/orders`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(secretKey+':').toString('base64')}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const raw = await res.text(); let data; try { data = raw ? JSON.parse(raw) : {} } catch { data = raw }
  return { ok: res.ok, status: res.status, data }
}

async function tryPayments(secretKey, payload) {
  const res = await fetch(`${pagarmeUrl}/payments`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(secretKey+':').toString('base64')}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const raw = await res.text(); let data; try { data = raw ? JSON.parse(raw) : {} } catch { data = raw }
  return { ok: res.ok, status: res.status, data }
}

async function tryCharges(secretKey, payload) {
  const res = await fetch(`${pagarmeUrl}/charges`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(secretKey+':').toString('base64')}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const raw = await res.text(); let data; try { data = raw ? JSON.parse(raw) : {} } catch { data = raw }
  return { ok: res.ok, status: res.status, data }
}

;(async ()=>{
  const results = []
  const tokenRes = await createToken()
  const token = tokenRes.id || tokenRes.token

  const variants = [
    ['customer_billing', p => { p.customer.billing = { value: p.billing.value, amount: p.billing.amount, currency: 'BRL' } }],
    ['payments_transactions_array', p => { p.payments[0].transactions = [{ billing: p.billing }] }],
    ['payments_transactions_obj', p => { p.payments[0].transactions = { billing: p.billing } }],
    ['payments_last_transaction', p => { p.payments[0].last_transaction = { billing: p.billing } }],
    ['payments_transactions_nested_billing_value', p => { p.payments[0].transactions = [{ meta: { billing: p.billing } }] }],
    ['creditcard_transaction_billing_value_only', p => { p.payments[0].credit_card = p.payments[0].credit_card || {}; p.payments[0].credit_card.transaction = { billing: { value: p.billing.value } } }],
    ['payments_credit_card_card_token_and_billing', p => { p.payments[0].credit_card = { card_token: token, billing: p.billing } }],
    ['payments_credit_card_card_token_and_transaction_billing', p => { p.payments[0].credit_card = { card_token: token, transaction: { billing: p.billing } } }],
    ['payments_top_and_nested', p => { p.top_billing = p.billing; p.payments[0].nested_billing = p.billing }],
  ]

  for (const [name, mutate] of variants) {
    const payload = basePayload(token)
    mutate(payload)
    try {
      const rOrder = await tryOrder(PAGARME_SECRET_KEY, payload)
      fs.writeFileSync(`/tmp/pagarme_deep_${name}_order.json`, JSON.stringify({ payload, result: rOrder }, null, 2))
      const rPayments = await tryPayments(PAGARME_SECRET_KEY, { amount: payload.billing.amount, payment_method: 'credit_card', credit_card: { card_token: token }, billing: payload.billing, customer: payload.customer })
      fs.writeFileSync(`/tmp/pagarme_deep_${name}_payments.json`, JSON.stringify({ payload: { amount: payload.billing.amount, payment_method: 'credit_card', credit_card: { card_token: token }, billing: payload.billing, customer: payload.customer }, result: rPayments }, null, 2))
      const rCharges = await tryCharges(PAGARME_SECRET_KEY, { amount: payload.billing.amount, currency: 'BRL', card_token: token, billing: payload.billing })
      fs.writeFileSync(`/tmp/pagarme_deep_${name}_charges.json`, JSON.stringify({ payload: { amount: payload.billing.amount, currency: 'BRL', card_token: token, billing: payload.billing }, result: rCharges }, null, 2))

      results.push({ name, order: rOrder, payments: rPayments, charges: rCharges })
      console.log(name, '=>', rOrder.ok ? 'order-ok' : 'order-fail', rPayments.ok ? 'payments-ok' : 'payments-fail', rCharges.ok ? 'charges-ok' : 'charges-fail')
    } catch (e) {
      console.error('error variant', name, e)
      results.push({ name, error: String(e) })
    }
    await new Promise(r => setTimeout(r, 500))
  }

  fs.writeFileSync('/tmp/pagarme_deep_results.json', JSON.stringify(results, null, 2))
  console.log('Done. Results in /tmp/pagarme_deep_results.json')
})()
