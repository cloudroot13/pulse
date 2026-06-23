#!/usr/bin/env node
/*
Runs multiple payload variations against Pagar.me /orders to find which `billing.value` placement/format is accepted.
Usage: PAGARME_PUBLIC_KEY=pk_... PAGARME_SECRET_KEY=sk_... node scripts/pagarme-billing-variants.cjs
*/
const fs = require('fs')

const PAGARME_PUBLIC_KEY = process.env.PAGARME_PUBLIC_KEY
const PAGARME_SECRET_KEY = process.env.PAGARME_SECRET_KEY
const pagarmeUrl = process.env.PAGARME_API_URL || 'https://api.pagar.me/core/v5'

if (!PAGARME_PUBLIC_KEY || !PAGARME_SECRET_KEY) {
  console.error('PAGARME_PUBLIC_KEY and PAGARME_SECRET_KEY must be set')
  process.exit(1)
}

function onlyDigits(s){ return String(s||'').replace(/\D/g,'') }

function genCPF(){
  const n = Array.from({length:9}, ()=>Math.floor(Math.random()*10))
  const d1 = ((n.reduce((s,x,i)=>s + x*(10-i),0))*10)%11 % 10
  const d2 = ((n.concat(d1).reduce((s,x,i)=>s + x*(11-i),0))*10)%11 % 10
  return n.join('') + String(d1) + String(d2)
}

async function createToken() {
  console.log('Creating card token via Pagar.me (public key)...')
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

function basePayload(token) {
  const cpf = genCPF()
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
    items: [{ amount: 1000, description: 'Produto', quantity: 1, code: 't1' }],
    payments: [{ payment_method: 'credit_card', amount: 1000, credit_card: { card_token: token } }],
  }
}

async function tryVariant(name, mutate) {
  try {
    const tokenJson = await createToken()
    const token = tokenJson.id || tokenJson.token || tokenJson.card?.id
    const payload = basePayload(token)
    mutate(payload)
    const res = await fetch(`${pagarmeUrl}/orders`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(PAGARME_SECRET_KEY+':').toString('base64')}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const raw = await res.text()
    let data
    try { data = raw ? JSON.parse(raw) : {} } catch { data = raw }
    const out = { name, ok: res.ok, status: res.status, payload, data }
    fs.writeFileSync(`/tmp/pagarme_billing_${name}.json`, JSON.stringify(out, null, 2))
    return out
  } catch (e) {
    return { name, error: String(e) }
  }
}

;(async ()=>{
  const variants = [
    ['top_value_string', p => { p.billing = { value: '10.00', amount: 1000, currency: 'BRL' } }],
    ['top_value_int', p => { p.billing = { value: 1000, amount: 1000, currency: 'BRL' } }],
    ['payments_value_string', p => { p.payments[0].billing = { value: '10.00', amount: 1000, currency: 'BRL' } }],
    ['payments_value_int', p => { p.payments[0].billing = { value: 1000, amount: 1000, currency: 'BRL' } }],
    ['cc_billing_value_string', p => { p.payments[0].credit_card.billing = { value: '10.00', amount: 1000, currency: 'BRL' } }],
    ['cc_billing_value_int', p => { p.payments[0].credit_card.billing = { value: 1000, amount: 1000, currency: 'BRL' } }],
    ['all_places_string', p => { p.billing = { value: '10.00', amount: 1000, currency: 'BRL' }; p.payments[0].billing = { value: '10.00', amount: 1000, currency: 'BRL' }; p.payments[0].credit_card.billing = { value: '10.00', amount: 1000, currency: 'BRL' } }],
    ['all_places_int', p => { p.billing = { value: 1000, amount: 1000, currency: 'BRL' }; p.payments[0].billing = { value: 1000, amount: 1000, currency: 'BRL' }; p.payments[0].credit_card.billing = { value: 1000, amount: 1000, currency: 'BRL' } }],
    ['cc_billing_address', p => { p.payments[0].credit_card.billing_address = { name: p.customer.name, email: p.customer.email, document: p.customer.document, street: p.customer.address.street, street_number: p.customer.address.street_number || p.customer.address.street_number || '1', neighborhood: p.customer.address.neighborhood, city: p.customer.address.city, state: p.customer.address.state, zip_code: p.customer.address.zip_code, country: p.customer.address.country, phone: p.customer.phones } }],
  ]

  const results = []
  for (const [name, mutate] of variants) {
    console.log('Testing variant:', name)
    await new Promise(r=>setTimeout(r, 500))
    const r = await tryVariant(name, mutate)
    console.log('->', r.ok ? 'ok' : 'fail', r.status || r.error)
    results.push(r)
  }
  fs.writeFileSync('/tmp/pagarme_billing_results.json', JSON.stringify(results, null, 2))
  console.log('Done. Results saved to /tmp/pagarme_billing_results.json and individual files.')
})()
