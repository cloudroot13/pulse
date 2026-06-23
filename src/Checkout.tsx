import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { BadgeCheck, ChevronLeft, CreditCard, LockKeyhole, QrCode, ShieldCheck, Truck } from 'lucide-react'
import { recordOrder } from './utils/analytics'
import { validateCoupon } from './data/coupons'
import type { Coupon } from './data/coupons'
import { getCurrentCustomer, markCouponAsUsed, updateCustomer } from './utils/customer'
import { pagarmeConfig } from './config/pagarme'

type CartItem = { name: string; price: string; quantity: number; image?: string }
type PaymentMethod = 'card' | 'pix' | 'boleto'
type ShippingMethod = 'standard' | 'express'
type Address = { name: string; street: string; city: string; state: string; zip: string; phone: string }
type Billing = { cpf: string; company: string }
type CheckoutOrder = {
  id: string
  total: number
  subtotal: number
  shipping: number
  discount: number
  couponCode?: string
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
  customerId: string
  customer: { name: string; email: string; phone: string; address: Address; billing: Billing }
  items: CartItem[]
  status: 'confirmado'
  providerId?: string
  providerStatus?: string
  date: string
}

const parsePrice = (price: string) => Number(price.replace('R$', '').replace(/\./g, '').replace(',', '.'))
const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const storageSafeSet = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    console.warn(`Nao foi possivel salvar ${key} no navegador.`)
  }
}

const saveOrder = (order: CheckoutOrder) => {
  try {
    const raw = localStorage.getItem('pulse_orders')
    const orders = raw ? JSON.parse(raw) as CheckoutOrder[] : []
    localStorage.setItem('pulse_orders', JSON.stringify([order, ...orders].slice(0, 80)))
  } catch {
    console.warn('Nao foi possivel salvar o pedido no painel.')
  }
}

const createPaymentOrder = async (order: CheckoutOrder) => {
  const apiUrl = pagarmeConfig.apiUrl
  if (!apiUrl) return null

  const response = await fetch(`${apiUrl}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...order,
      paymentMethod: order.paymentMethod === 'card' ? 'credit_card' : order.paymentMethod,
      // Attach customer.document from billing CPF to support boleto creation
      customer: {
        ...order.customer,
        document: order.customer?.billing?.cpf?.replace(/\D/g, ''),
      },
      items: order.items.map((item) => ({
        id: item.name,
        name: item.name,
        quantity: item.quantity,
        unitPrice: parsePrice(item.price),
      })),
    }),
  })

  // The server returns a standardized envelope: { success, approved, errors, data }
  try {
    return await response.json()
  } catch {
    return null
  }
}

const createHostedCheckout = async (order: CheckoutOrder) => {
  const apiUrl = pagarmeConfig.apiUrl
  if (!apiUrl) return null

  const body = {
    ...order,
    items: order.items.map((item) => ({ id: item.name, name: item.name, quantity: item.quantity, unitPrice: parsePrice(item.price) })),
    customer: {
      ...order.customer,
      document: order.customer?.billing?.cpf?.replace(/\D/g, ''),
    },
  }

  const response = await fetch(`${apiUrl}/api/payments/create-hosted-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Falha ao criar sessão hospedada')
  }
  return response.json()
}

export default function CheckoutPage() {
  const customer = getCurrentCustomer()
  const [cartItems] = useState<CartItem[]>(() => {
    try {
      const raw = sessionStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(customer?.email ?? '')
  const [address, setAddress] = useState<Address>(customer?.address ?? { name: '', street: '', city: '', state: '', zip: '', phone: '' })
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billing, setBilling] = useState<Billing>({ cpf: '', company: '' })
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState<CheckoutOrder | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponMessage, setCouponMessage] = useState('')

  const contactRef = useRef<HTMLDivElement | null>(null)
  const addressRef = useRef<HTMLDivElement | null>(null)
  const billingRef = useRef<HTMLDivElement | null>(null)
  const paymentRef = useRef<HTMLDivElement | null>(null)

  const subtotal = useMemo(() => cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0), [cartItems])
  const shippingCost = shippingMethod === 'standard' ? 15 : 25
  const couponDiscount = useMemo(() => (appliedCoupon ? validateCoupon(appliedCoupon.code, subtotal).discount : 0), [appliedCoupon, subtotal])
  const total = Math.max(0, subtotal + shippingCost - couponDiscount)
  const hasItems = cartItems.length > 0

  useEffect(() => {
    if (!customer) window.location.hash = '#/'
    if (!hasItems && !orderPlaced) window.location.hash = '#/'
  }, [customer, hasItems, orderPlaced])

  useEffect(() => {
    const refs = [null, contactRef, addressRef, billingRef, paymentRef]
    refs[step]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  const validateContact = () => {
    const nextErrors: Record<string, string> = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Digite um email valido.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateAddress = () => {
    const nextErrors: Record<string, string> = {}
    if (address.name.trim().length < 3) nextErrors.name = 'Informe o nome completo.'
    if (address.street.trim().length < 6) nextErrors.street = 'Informe rua, numero e complemento se houver.'
    if (address.city.trim().length < 2) nextErrors.city = 'Informe a cidade.'
    if (address.state.trim().length < 2) nextErrors.state = 'Informe o UF.'
    if (address.zip.replace(/\D/g, '').length < 8) nextErrors.zip = 'Informe um CEP valido.'
    if (address.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Informe um telefone valido.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateBilling = () => {
    const nextErrors: Record<string, string> = {}
    if (billing.cpf.replace(/\D/g, '').length < 11) nextErrors.cpf = 'Informe um CPF valido.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  // Pure, non-state validators used to gate form submission (do not call setState)
  const isEmailValid = (value: string) => /^\S+@\S+\.\S+$/.test(value)
  const isZipValid = (value: string) => value.replace(/\D/g, '').length >= 8
  const isPhoneValid = (value: string) => value.replace(/\D/g, '').length >= 10
  const isCpfValid = (value: string) => value.replace(/\D/g, '').length >= 11

  function luhnCheck(cardNumber: string) {
    const digits = cardNumber.replace(/\D/g, '')
    let sum = 0
    let shouldDouble = false
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = Number(digits.charAt(i))
      if (shouldDouble) {
        d *= 2
        if (d > 9) d -= 9
      }
      sum += d
      shouldDouble = !shouldDouble
    }
    return digits.length >= 12 && sum % 10 === 0
  }

  const isCardValid = () => {
    const num = cardNumber.replace(/\s+/g, '')
    if (!num || !/^[0-9]{12,19}$/.test(num)) return false
    if (!luhnCheck(num)) return false
    const [m, y] = cardExpiry.split('/').map((s) => s && s.trim())
    if (!m || !y) return false
    const month = Number(m.padStart(2, '0'))
    let year = Number(y)
    if (y.length === 2) year = Number(`20${y}`)
    const now = new Date()
    if (!month || month < 1 || month > 12) return false
    const exp = new Date(year, month - 1, 1)
    if (isNaN(exp.getTime())) return false
    if (exp < new Date(now.getFullYear(), now.getMonth(), 1)) return false
    if (!/^[0-9]{3,4}$/.test(cardCvv)) return false
    if (!cardName || cardName.trim().length < 2) return false
    return true
  }

  const canFinalize = useMemo(() => {
    if (!acceptedTerms || orderLoading || !hasItems || !customer) return false
    if (!isEmailValid(email)) return false
    if (!isPhoneValid(address.phone)) return false
    if (!isZipValid(address.zip)) return false
    if (!isCpfValid(billing.cpf)) return false
    if (paymentMethod === 'card') return isCardValid()
    // for pix/boleto basic checks passed above
    return true
  }, [acceptedTerms, orderLoading, hasItems, customer, email, address.phone, address.zip, billing.cpf, paymentMethod, cardNumber, cardExpiry, cardCvv, cardName])

  const completeOrder = async () => {
    if (!acceptedTerms || !hasItems || !customer) return
    setOrderLoading(true)
    try {
      // final guard: run validators and show errors if any
      const finalErrors: Record<string, string> = {}
      if (!isEmailValid(email)) finalErrors.email = 'Email invalido.'
      if (!isPhoneValid(address.phone)) finalErrors.phone = 'Telefone invalido.'
      if (!isZipValid(address.zip)) finalErrors.zip = 'CEP invalido.'
      if (!isCpfValid(billing.cpf)) finalErrors.cpf = 'CPF invalido.'
      if (paymentMethod === 'card' && !isCardValid()) finalErrors.card = 'Dados do cartao invalidos.'
      if (Object.keys(finalErrors).length) {
        setErrors(finalErrors)
        setOrderLoading(false)
        return
      }
      await new Promise((resolve) => window.setTimeout(resolve, 700))
      const order: CheckoutOrder = {
        id: `PP-${Math.floor(Math.random() * 900000 + 100000)}`,
        total,
        subtotal,
        shipping: shippingCost,
        discount: couponDiscount,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        shippingMethod,
        customerId: customer.id,
        customer: { name: customer.name, email, phone: address.phone, address, billing },
        items: cartItems,
        status: 'confirmado',
        date: new Date().toISOString(),
      }
      try {
        // If payment method is card, prefer Hosted Checkout (faster for approvals)
        if (order.paymentMethod === 'card') {
          try {
            const hosted = await createHostedCheckout(order)
            if (hosted && (hosted.checkoutUrl || hosted.url || hosted.session?.url)) {
              // Save order locally before redirect
              saveOrder(order)
              const redirectUrl = hosted.checkoutUrl || hosted.url || hosted.session.url
              window.location.href = redirectUrl
              return
            }
            // If hosted checkout failed to return a URL, throw to surface error
            throw new Error('Hosted checkout did not return a URL')
          } catch (hostErr) {
            console.warn('Hosted checkout failed', hostErr)
            throw hostErr
          }
        }

        const providerOrder = await createPaymentOrder(order)
        if (providerOrder) {
          // providerOrder is an envelope: { success, approved, errors, data }
          order.providerId = providerOrder.data?.id || providerOrder.data?.code || providerOrder.id
          order.providerStatus = providerOrder.approved ? 'paid' : (providerOrder.data?.status || (providerOrder.success ? 'pending' : 'failed'))
          if (providerOrder.errors && providerOrder.errors.length) (order as any).providerMessage = providerOrder.errors.join('; ')
          // If Pix, try to extract PIX payload/QR from provider response and attach to the order
          try {
            const data = providerOrder.data || {}
            const charge = (data.charges && data.charges[0]) || data.checkouts && data.checkouts[0] || data
            const lastTx = charge?.last_transaction || {}
            const pixObj = lastTx.pix || lastTx.qr_code || data.pix || charge?.pix || lastTx
            if (pixObj && Object.keys(pixObj).length) {
              // attach raw pix object for rendering after order placed
              ;(order as any).providerPix = pixObj
            }
          } catch (e) {
            // ignore
          }
        }
      } catch {
        console.warn('Gateway indisponivel. Pedido salvo localmente para acompanhamento.')
      }
      saveOrder(order)
      recordOrder(order.id, order.total)
      updateCustomer({ ...customer, email, phone: address.phone, address })
      if (appliedCoupon) markCouponAsUsed(customer.id, appliedCoupon.code)
      try {
        sessionStorage.removeItem('cart')
      } catch {
        console.warn('Nao foi possivel limpar o carrinho no navegador.')
      }
      setOrderPlaced(order)
    } finally {
      setOrderLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
        <main className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-10">
          <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <BadgeCheck className="size-9" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-950 sm:text-4xl">Pedido confirmado</h1>
          <p className="mt-3 text-slate-600">Recebemos seu pedido e salvamos o registro no dashboard administrativo.</p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Pedido</span>
              <strong>{orderPlaced.id}</strong>
            </div>
            <div className="mt-3 flex justify-between gap-4">
              <span className="text-slate-500">Total</span>
              <strong>{formatCurrency(orderPlaced.total)}</strong>
            </div>
            {orderPlaced.couponCode && (
              <div className="mt-3 flex justify-between gap-4">
                <span className="text-slate-500">Cupom</span>
                <strong>{orderPlaced.couponCode}</strong>
              </div>
            )}
            <div className="mt-3 flex justify-between gap-4">
              <span className="text-slate-500">Pagamento</span>
              <div className="text-right">
                <strong className="uppercase">{orderPlaced.paymentMethod}</strong>
                <div className="text-sm text-slate-500">{orderPlaced.providerStatus === 'paid' ? 'APROVADO' : (orderPlaced.providerStatus || 'Pendente')}</div>
              </div>
            </div>
            {(orderPlaced as any).providerMessage && (
              <div className="mt-3 text-sm text-red-600">{(orderPlaced as any).providerMessage}</div>
            )}
            {(orderPlaced as any).providerPix && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-black">Pix gerado</p>
                <div className="mt-3 flex flex-col items-center gap-3">
                  {(() => {
                    const pix = (orderPlaced as any).providerPix || {}
                    const payload = pix.payload || pix.qr_code || pix.qrcode || pix.code || JSON.stringify(pix)
                    // If the provider returned an SVG QR, render inline
                    if (typeof payload === 'string' && payload.trim().startsWith('<svg')) {
                      return <div className="w-52" dangerouslySetInnerHTML={{ __html: payload }} />
                    }
                    // if base64 image provided
                    if (pix.qr_code_base64) {
                      return <img src={`data:image/png;base64,${pix.qr_code_base64}`} alt="Pix QR" className="w-48" />
                    }
                    // fallback: generate QR via Google Chart API from payload
                    if (payload) {
                      const src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(payload)}`
                      return <img src={src} alt="Pix QR" className="w-48" />
                    }
                    return <textarea readOnly className="w-full rounded-md border p-2 text-sm" value={JSON.stringify(pix, null, 2)} />
                  })()}
                  <div className="flex gap-2">
                    <button type="button" className="rounded-full bg-blue-950 px-4 py-2 text-white" onClick={async () => { const pix = (orderPlaced as any).providerPix || {}; const txt = pix.payload || pix.qr_code || JSON.stringify(pix); await navigator.clipboard.writeText(String(txt || '')); }}>Copiar código</button>
                    <a className="rounded-full border px-4 py-2" href="#" onClick={(e) => { e.preventDefault(); window.open((orderPlaced as any).providerPix?.resource_url || (orderPlaced as any).providerPix?.url || '#', '_blank') }}>Abrir link</a>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button type="button" className="mt-8 rounded-full bg-blue-950 px-7 py-4 font-black uppercase text-white transition hover:bg-sky-800" onClick={() => { window.location.hash = ''; window.location.href = '/' }}>
            Voltar para loja
          </button>
        </main>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-950">
        <main className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl shadow-slate-900/10">
          <LockKeyhole className="mx-auto size-12 text-blue-950" aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-black">Login obrigatório</h1>
          <p className="mt-3 text-slate-600">Para proteger seus dados e acompanhar o pedido, entre ou crie uma conta antes de finalizar a compra.</p>
          <button type="button" className="mt-6 rounded-full bg-blue-950 px-7 py-4 font-black uppercase text-white" onClick={() => { window.location.hash = '#/' }}>
            Voltar para loja
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_420px] lg:px-8">
        <section className="space-y-6">
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black uppercase text-sky-700 transition hover:bg-cyan-50" onClick={() => { window.location.hash = '#/' }}>
            <ChevronLeft className="size-5" aria-hidden="true" />
            Voltar para loja
          </button>

          <div className="rounded-3xl bg-blue-950 p-6 text-white shadow-xl shadow-blue-950/15 sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase text-blue-950">
              <LockKeyhole className="size-4" aria-hidden="true" />
              Checkout seguro
            </span>
            <h1 className="mt-5 text-3xl font-black sm:text-5xl">Finalize sua compra</h1>
            <p className="mt-3 max-w-2xl text-cyan-50">Fluxo preparado para produção, com validação, pedido salvo no painel e estrutura pronta para integrar Mercado Pago, Stripe ou Pagar.me.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {['Contato', 'Entrega', 'Faturamento', 'Pagamento'].map((label, index) => (
              <div key={label} className={`${step >= index + 1 ? 'border-cyan-300 bg-cyan-50 text-blue-950' : 'border-slate-200 bg-white text-slate-500'} rounded-2xl border p-4 text-sm font-black`}>
                <span className="block text-xs uppercase">Etapa {index + 1}</span>
                {label}
              </div>
            ))}
          </div>

          <div ref={contactRef} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">1. Contato</h2>
              {step > 1 && <BadgeCheck className="size-6 text-emerald-600" aria-hidden="true" />}
            </div>
            <div className="mt-5 grid gap-3">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl border border-slate-300 px-4 py-4 text-base outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="voce@email.com" type="email" autoComplete="email" />
                {errors.email && <span className="text-red-600">{errors.email}</span>}
              </label>
              <button type="button" className="w-fit rounded-full bg-blue-950 px-7 py-4 font-black uppercase text-white transition hover:bg-sky-800" onClick={() => {
                if (!validateContact()) return
                storageSafeSet('checkoutEmail', email)
                setStep(2)
              }}>
                Prosseguir
              </button>
            </div>
          </div>

          {step >= 2 && (
            <div ref={addressRef} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">2. Entrega</h2>
                {step > 2 && <BadgeCheck className="size-6 text-emerald-600" aria-hidden="true" />}
              </div>
              <div className="mt-5 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nome completo" error={errors.name} value={address.name} onChange={(value) => setAddress((current) => ({ ...current, name: value }))} autoComplete="name" />
                  <Field label="Telefone" error={errors.phone} value={address.phone} onChange={(value) => setAddress((current) => ({ ...current, phone: value }))} autoComplete="tel" />
                </div>
                <Field label="Rua, número e complemento" error={errors.street} value={address.street} onChange={(value) => setAddress((current) => ({ ...current, street: value }))} autoComplete="street-address" />
                <div className="grid gap-3 sm:grid-cols-[1fr_100px_140px]">
                  <Field label="Cidade" error={errors.city} value={address.city} onChange={(value) => setAddress((current) => ({ ...current, city: value }))} autoComplete="address-level2" />
                  <Field label="UF" error={errors.state} value={address.state} onChange={(value) => setAddress((current) => ({ ...current, state: value.toUpperCase().slice(0, 2) }))} autoComplete="address-level1" />
                  <Field label="CEP" error={errors.zip} value={address.zip} onChange={(value) => setAddress((current) => ({ ...current, zip: value }))} autoComplete="postal-code" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ShippingCard active={shippingMethod === 'standard'} title="Entrega padrão" subtitle="5 a 8 dias úteis" price="R$15,00" onClick={() => setShippingMethod('standard')} />
                  <ShippingCard active={shippingMethod === 'express'} title="Entrega expressa" subtitle="2 a 4 dias úteis" price="R$25,00" onClick={() => setShippingMethod('express')} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="rounded-full bg-blue-950 px-7 py-4 font-black uppercase text-white transition hover:bg-sky-800" onClick={() => {
                    if (!validateAddress()) return
                    storageSafeSet('checkoutAddress', JSON.stringify(address))
                    setStep(3)
                  }}>
                    Prosseguir
                  </button>
                  <button type="button" className="rounded-full border border-slate-300 px-7 py-4 font-black uppercase text-slate-700" onClick={() => setStep(1)}>
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          )}

          {step >= 3 && (
            <div ref={billingRef} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">3. Faturamento</h2>
                {step > 3 && <BadgeCheck className="size-6 text-emerald-600" aria-hidden="true" />}
              </div>
              <div className="mt-5 grid gap-4">
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                  <input type="checkbox" checked={billingSameAsShipping} onChange={(event) => setBillingSameAsShipping(event.target.checked)} />
                  Mesmo endereço da entrega
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="CPF" error={errors.cpf} value={billing.cpf} onChange={(value) => setBilling((current) => ({ ...current, cpf: value }))} autoComplete="off" />
                  <Field label="Empresa (opcional)" value={billing.company} onChange={(value) => setBilling((current) => ({ ...current, company: value }))} autoComplete="organization" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="rounded-full bg-blue-950 px-7 py-4 font-black uppercase text-white transition hover:bg-sky-800" onClick={() => {
                    if (!validateBilling()) return
                    storageSafeSet('checkoutBilling', JSON.stringify(billing))
                    setStep(4)
                  }}>
                    Prosseguir
                  </button>
                  <button type="button" className="rounded-full border border-slate-300 px-7 py-4 font-black uppercase text-slate-700" onClick={() => setStep(2)}>
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          )}

          {step >= 4 && (
            <div ref={paymentRef} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black">4. Pagamento</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <PaymentCard active={paymentMethod === 'card'} icon={<CreditCard className="size-5" />} title="Cartão" onClick={() => setPaymentMethod('card')} />
                <PaymentCard active={paymentMethod === 'pix'} icon={<QrCode className="size-5" />} title="Pix" onClick={() => setPaymentMethod('pix')} />
                <PaymentCard active={paymentMethod === 'boleto'} icon={<ShieldCheck className="size-5" />} title="Boleto" onClick={() => setPaymentMethod('boleto')} />
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4">
                  <label className="text-sm font-bold">
                    Nome no cartão
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="Nome impresso no cartão" autoComplete="cc-name" />
                  </label>
                  <label className="text-sm font-bold">
                    Número do cartão
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="4111 1111 1111 1111" inputMode="numeric" autoComplete="cc-number" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-bold">
                      Validade (MM/YY)
                      <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="MM/AA" autoComplete="cc-exp" />
                    </label>
                    <label className="text-sm font-bold">
                      CVV
                      <input value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" />
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="mt-5 flex items-center gap-4 rounded-2xl bg-cyan-50 p-4 text-blue-950">
                  <div className="grid size-24 place-items-center rounded-2xl bg-white">
                    <QrCode className="size-12" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-black">Pix instantâneo</p>
                    <p className="mt-1 text-sm">Ao finalizar, o pedido fica registrado e pronto para receber integração com QR Code real.</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'boleto' && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  Boleto visual pronto para produção. Integre o provedor de pagamento para gerar código de barras real.
                </div>
              )}

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                <input className="mt-1" type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
                Confirmo que revisei os dados do pedido e aceito os termos de compra.
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="rounded-full bg-blue-950 px-8 py-4 font-black uppercase text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canFinalize} onClick={completeOrder}>
                  {orderLoading ? 'Processando...' : 'Finalizar pedido'}
                </button>
                <button type="button" className="rounded-full border border-slate-300 px-7 py-4 font-black uppercase text-slate-700" onClick={() => setStep(3)}>
                  Voltar
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/10 lg:sticky lg:top-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-cyan-100 text-blue-950">
              <Truck className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-black">Resumo do pedido</h2>
              <p className="text-sm text-slate-500">{cartItems.length} item(ns) no carrinho</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.image && <img src={item.image} alt="" className="size-14 rounded-2xl bg-slate-50 object-contain p-1" />}
                  <div>
                    <p className="text-sm font-black">{item.name}</p>
                    <p className="text-xs text-slate-500">Quantidade: {item.quantity}</p>
                  </div>
                </div>
                <strong>{formatCurrency(parsePrice(item.price) * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Cupom de desconto
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    placeholder="PULSE10"
                  />
                  <button
                    type="button"
                    className="rounded-full bg-blue-950 px-4 py-3 text-xs font-black uppercase text-white transition hover:bg-sky-800"
                    onClick={() => {
                      const result = validateCoupon(couponCode, subtotal)
                      if (result.valid && result.coupon && customer.usedCoupons.includes(result.coupon.code.toUpperCase())) {
                        setCouponMessage('Este cupom ja foi usado por este cliente.')
                        setAppliedCoupon(null)
                        return
                      }
                      setCouponMessage(result.message)
                      setAppliedCoupon(result.valid ? result.coupon : null)
                    }}
                  >
                    Aplicar
                  </button>
                </div>
              </label>
              {couponMessage && <p className={`${appliedCoupon ? 'text-emerald-700' : 'text-red-600'} mt-2 text-sm font-bold`}>{couponMessage}</p>}
              {appliedCoupon && (
                <button type="button" className="mt-2 text-sm font-black uppercase text-sky-700" onClick={() => { setAppliedCoupon(null); setCouponMessage('Cupom removido.'); setCouponCode('') }}>
                  Remover cupom
                </button>
              )}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <strong className="text-slate-950">{formatCurrency(subtotal)}</strong>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Desconto</span>
                <strong>-{formatCurrency(couponDiscount)}</strong>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Frete</span>
              <strong className="text-slate-950">{formatCurrency(shippingCost)}</strong>
            </div>
            <div className="flex justify-between text-xl font-black text-slate-950">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            Pagamento em ambiente visual. Para cobrança real, conecte o gateway escolhido na ação de finalizar pedido.
          </div>
        </aside>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, error, autoComplete }: { label: string; value: string; onChange: (value: string) => void; error?: string; autoComplete?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-300 px-4 py-4 text-base outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" autoComplete={autoComplete} />
      {error && <span className="text-red-600">{error}</span>}
    </label>
  )
}

function ShippingCard({ active, title, subtitle, price, onClick }: { active: boolean; title: string; subtitle: string; price: string; onClick: () => void }) {
  return (
    <button type="button" className={`${active ? 'border-cyan-300 bg-cyan-50 text-blue-950' : 'border-slate-200 bg-white text-slate-700'} rounded-2xl border p-4 text-left transition hover:border-cyan-300`} onClick={onClick}>
      <span className="block font-black">{title}</span>
      <span className="mt-1 block text-sm">{subtitle}</span>
      <strong className="mt-3 block">{price}</strong>
    </button>
  )
}

function PaymentCard({ active, icon, title, onClick }: { active: boolean; icon: ReactNode; title: string; onClick: () => void }) {
  return (
    <button type="button" className={`${active ? 'border-cyan-300 bg-blue-950 text-white' : 'border-slate-200 bg-white text-slate-700'} flex items-center justify-center gap-2 rounded-2xl border p-4 font-black transition hover:border-cyan-300`} onClick={onClick}>
      {icon}
      {title}
    </button>
  )
}
