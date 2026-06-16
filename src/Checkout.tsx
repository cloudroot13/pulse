import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { BadgeCheck, ChevronLeft, CreditCard, LockKeyhole, QrCode, ShieldCheck, Truck } from 'lucide-react'
import { recordOrder } from './utils/analytics'
import { validateCoupon } from './data/coupons'
import type { Coupon } from './data/coupons'
import { getCurrentCustomer, markCouponAsUsed, updateCustomer } from './utils/customer'

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
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return null

  const response = await fetch(`${apiUrl}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...order,
      paymentMethod: order.paymentMethod === 'card' ? 'credit_card' : order.paymentMethod,
      items: order.items.map((item) => ({
        id: item.name,
        name: item.name,
        quantity: item.quantity,
        unitPrice: parsePrice(item.price),
      })),
    }),
  })

  if (!response.ok) throw new Error('Falha ao criar pedido no gateway.')
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

  const completeOrder = async () => {
    if (!acceptedTerms || !hasItems || !customer) return
    setOrderLoading(true)
    try {
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
        const providerOrder = await createPaymentOrder(order)
        if (providerOrder?.id) {
          order.providerId = providerOrder.id
          order.providerStatus = providerOrder.status
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
              <strong className="uppercase">{orderPlaced.paymentMethod}</strong>
            </div>
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
                  <input className="rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="Nome impresso no cartão" autoComplete="cc-name" />
                  <input className="rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="Número do cartão" inputMode="numeric" autoComplete="cc-number" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="MM/AA" autoComplete="cc-exp" />
                    <input className="rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" />
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
                <button type="button" className="rounded-full bg-blue-950 px-8 py-4 font-black uppercase text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!acceptedTerms || orderLoading} onClick={completeOrder}>
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
