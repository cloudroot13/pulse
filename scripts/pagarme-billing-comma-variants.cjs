#!/usr/bin/env node
/* Test billing.value with comma decimal separator and variants */
const fs = require('fs')
const fetch = global.fetch || require('node-fetch')
const PAGARME_PUBLIC_KEY = process.env.PAGARME_PUBLIC_KEY
const PAGARME_SECRET_KEY = process.env.PAGARME_SECRET_KEY
const pagarmeUrl = process.env.PAGARME_API_URL || 'https://api.pagar.me/core/v5'
if (!PAGARME_PUBLIC_KEY || !PAGARME_SECRET_KEY) { console.error('set keys'); process.exit(1) }
function genCPF(){ const n = Array.from({length:9}, ()=>Math.floor(Math.random()*10)); const d1 = ((n.reduce((s,x,i)=>s + x*(10-i),0))*10)%11 % 10; const d2 = ((n.concat(d1).reduce((s,x,i)=>s + x*(11-i),0))*10)%11 % 10; return n.join('') + String(d1) + String(d2) }
async function createToken(){ const body={type:'card', card:{number:'4111111111111111', holder_name:'Cliente Teste', exp_month:12, exp_year:2028, cvv:'123'}}; const res=await fetch(`${pagarmeUrl}/tokens?appId=${encodeURIComponent(PAGARME_PUBLIC_KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const txt=await res.text(); return JSON.parse(txt) }
function base(token){ const cpf=genCPF(); const amount=100; return { code:`test_${Date.now()}`, customer:{name:'Cliente Teste', email:'teste@example.com', document:cpf, type:'individual', phones:{mobile_phone:{country_code:'55', area_code:'11', number:'999999999'}}, address:{street:'Rua X', street_number:'1', neighborhood:'Centro', city:'Sao Paulo', state:'SP', zip_code:'01234567', country:'BR'} }, items:[{amount:amount, description:'Produto', quantity:1, code:'t1'}], billing:{value:(amount/100).toFixed(2), amount:amount, currency:'BRL'}, payments:[{payment_method:'credit_card', amount:amount, credit_card:{card_token:token}}] }
}
async function post(path, payload){ const res=await fetch(`${pagarmeUrl}${path}`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(PAGARME_SECRET_KEY+':').toString('base64')}`, 'Content-Type':'application/json'}, body:JSON.stringify(payload)}); const raw=await res.text(); let data; try{data=raw?JSON.parse(raw):{}}catch{data=raw} return {ok:res.ok,status:res.status,data} }
;(async()=>{
  const tokenRes = await createToken(); const token = tokenRes.id || tokenRes.token
  const variants = [
    ['payments_value_comma', p=>{ p.payments[0].billing = { value: '1,00', amount: p.billing.amount, currency: 'BRL' } }],
    ['top_value_comma', p=>{ p.billing = { value: '1,00', amount: p.billing.amount, currency: 'BRL' } }],
    ['cc_transaction_value_comma', p=>{ p.payments[0].credit_card = p.payments[0].credit_card || {}; p.payments[0].credit_card.transaction = { billing: { value: '1,00', amount: p.billing.amount, currency: 'BRL' } } }],
    ['payments_transactions_billing_comma', p=>{ p.payments[0].transactions = [{ billing: { value: '1,00', amount: p.billing.amount, currency: 'BRL' } }] }],
  ]
  const results=[]
  for(const [name,mutate] of variants){ const p = base(token); mutate(p); const rOrder = await post('/orders', p); fs.writeFileSync(`/tmp/pagarme_comma_${name}_order.json`, JSON.stringify({payload:p,result:rOrder},null,2)); const rPayments = await post('/payments', { amount: p.billing.amount, payment_method:'credit_card', credit_card:{ card_token: token }, billing: p.billing, customer: p.customer }); fs.writeFileSync(`/tmp/pagarme_comma_${name}_payments.json`, JSON.stringify({payload:{amount:p.billing.amount, payment_method:'credit_card', credit_card:{card_token:token}, billing:p.billing, customer:p.customer}, result:rPayments},null,2)); const rCharges = await post('/charges', { amount: p.billing.amount, currency:'BRL', card_token: token, billing: p.billing }); fs.writeFileSync(`/tmp/pagarme_comma_${name}_charges.json`, JSON.stringify({payload:{amount:p.billing.amount, currency:'BRL', card_token:token, billing:p.billing}, result:rCharges},null,2)); results.push({name,order:rOrder,payments:rPayments,charges:rCharges}); console.log(name, rOrder.ok? 'order-ok':'order-fail', rPayments.ok? 'payments-ok':'payments-fail', rCharges.ok? 'charges-ok':'charges-fail'); await new Promise(r=>setTimeout(r,300)); }
  fs.writeFileSync('/tmp/pagarme_comma_results.json', JSON.stringify(results,null,2))
  console.log('Done. Results in /tmp/pagarme_comma_results.json')
})()
