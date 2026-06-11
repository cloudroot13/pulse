import { useEffect, useRef, useState } from 'react'
import { recordOrder } from './utils/analytics'
import { BadgeCheck } from 'lucide-react'

type CartItem = { name: string; price: string; quantity: number; image?: string }

const parsePrice = (price: string) => Number(price.replace('R$', '').replace(/\./g, '').replace(',', '.'))
const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CheckoutPage() {
  const [cartItems] = useState<CartItem[]>(() => {
    try {
      const raw = sessionStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [shippingMethod] = useState<'standard' | 'express'>('standard')
  const [orderPlaced, setOrderPlaced] = useState<{ id: string; total: number } | null>(null)

  useEffect(() => {
    if (cartItems.length === 0) {
      window.location.hash = '#/'
    }
  }, [cartItems.length])

  const cartSubtotal = cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0)
  const [step, setStep] = useState<number>(1)
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '' })
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billing, setBilling] = useState({ cpf: '', company: '' })
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'boleto' | 'pix' | 'credit' | null>('card')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)

  const contactRef = useRef<HTMLDivElement | null>(null)
  const addressRef = useRef<HTMLDivElement | null>(null)
  const billingRef = useRef<HTMLDivElement | null>(null)
  const paymentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // smooth scroll to the active section when step changes
    const refs = [null, contactRef, addressRef, billingRef, paymentRef]
    const targetRef = refs[step]
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step])

  

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto w-full max-w-6xl py-8 px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_420px]">
          <section>
            <h1 className="text-3xl font-black">Pagamento</h1>
            <p className="mt-2 text-sm text-slate-600">Insira os dados de entrega e pagamento para concluir sua compra. A página está pronta para produção — adicione apenas o token do provedor de pagamento.</p>

            <div className="mt-6 space-y-6">
              {/* Step 1: Contact */}
              <div ref={contactRef} className={`rounded-lg border ${step > 1 ? 'bg-slate-50' : 'bg-white'} p-4 transition-all duration-300 ease-out animate-fade-up`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">1. Contato</h3>
                  {step > 1 && <BadgeCheck className="size-5 text-green-600" />}
                </div>
                {step === 1 ? (
                  <div className="mt-3 grid gap-3">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-3" placeholder="Endereço de e-mail" />
                    <div className="flex items-center gap-3">
                      <button className="rounded-full bg-slate-800 px-6 py-3 font-black text-white" onClick={() => {
                        setStep(2)
                        try {
                          sessionStorage.setItem('checkoutEmail', email)
                        } catch {
                          console.warn('Nao foi possivel salvar o email no navegador.')
                        }
                      }}>Prosseguir à entrega</button>
                      <button className="rounded-full border px-6 py-3 font-black text-slate-700" onClick={() => window.location.hash = '#/'}>Voltar</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-700">{email}</div>
                )}
              </div>

              {/* auto-scroll on step change */}
              

              {/* Step 2: Address */}
                {step >= 2 && (
                  <div ref={addressRef} className={`rounded-lg border ${step > 2 ? 'bg-slate-50' : 'bg-white'} p-4 transition-all duration-300 ease-out animate-fade-up`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">2. Endereço de entrega</h3>
                  {step > 2 && <BadgeCheck className="size-5 text-green-600" />}
                </div>
                {step === 2 ? (
                  <div className="mt-3 grid gap-3">
                    <input value={address.name} onChange={(e) => setAddress((s) => ({ ...s, name: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-3" placeholder="Nome completo" />
                    <input value={address.street} onChange={(e) => setAddress((s) => ({ ...s, street: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-3" placeholder="Rua, número, complemento" />
                    <div className="flex gap-3">
                      <input value={address.city} onChange={(e) => setAddress((s) => ({ ...s, city: e.target.value }))} className="rounded-md border border-slate-200 px-3 py-3 flex-1" placeholder="Cidade" />
                      <input value={address.state} onChange={(e) => setAddress((s) => ({ ...s, state: e.target.value }))} className="rounded-md border border-slate-200 px-3 py-3 w-24" placeholder="UF" />
                      <input value={address.zip} onChange={(e) => setAddress((s) => ({ ...s, zip: e.target.value }))} className="rounded-md border border-slate-200 px-3 py-3 w-32" placeholder="CEP" />
                    </div>
                    <input value={address.phone} onChange={(e) => setAddress((s) => ({ ...s, phone: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-3" placeholder="Telefone" />
                    <div className="flex items-center gap-3">
                      <button className="rounded-full bg-slate-800 px-6 py-3 font-black text-white" onClick={() => {
                        setStep(3)
                        try {
                          sessionStorage.setItem('checkoutAddress', JSON.stringify(address))
                        } catch {
                          console.warn('Nao foi possivel salvar o endereco no navegador.')
                        }
                      }}>Prosseguir ao faturamento</button>
                      <button className="rounded-full border px-6 py-3 font-black text-slate-700" onClick={() => setStep(1)}>Voltar</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-700">
                    <div>{address.name}</div>
                    <div>{address.street}</div>
                    <div>{address.city} {address.state} {address.zip}</div>
                    <div>{address.phone}</div>
                    <div className="mt-2">
                      <button className="text-sky-700 font-bold" onClick={() => setStep(2)}>Editar</button>
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Step 3: Billing / CPF */}
                {step >= 3 && (
                  <div ref={billingRef} className={`rounded-lg border ${step > 3 ? 'bg-slate-50' : 'bg-white'} p-4 transition-all duration-300 ease-out animate-fade-up`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">3. Faturamento</h3>
                  {step > 3 && <BadgeCheck className="size-5 text-green-600" />}
                </div>
                {step === 3 ? (
                  <div className="mt-3 grid gap-3">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} /> Mesmo endereço de entrega</label>
                    {!billingSameAsShipping && (
                      <input value={billing.company} onChange={(e) => setBilling((s) => ({ ...s, company: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-3" placeholder="Razão social (opcional)" />
                    )}
                    <input value={billing.cpf} onChange={(e) => setBilling((s) => ({ ...s, cpf: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-3" placeholder="CPF" />
                    <div className="flex items-center gap-3">
                      <button className="rounded-full bg-slate-800 px-6 py-3 font-black text-white" onClick={() => {
                        setStep(4)
                        try {
                          sessionStorage.setItem('checkoutBilling', JSON.stringify(billing))
                        } catch {
                          console.warn('Nao foi possivel salvar o faturamento no navegador.')
                        }
                      }}>Prosseguir ao pagamento</button>
                      <button className="rounded-full border px-6 py-3 font-black text-slate-700" onClick={() => setStep(2)}>Voltar</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-700">
                    <div>CPF: {billing.cpf}</div>
                    <div className="mt-2"><button className="text-sky-700 font-bold" onClick={() => setStep(3)}>Editar</button></div>
                  </div>
                )}
                </div>
              )}

              {/* Step 4: Payment method */}
                {step >= 4 && (
                  <div ref={paymentRef} className={`rounded-lg border ${step > 4 ? 'bg-slate-50' : 'bg-white'} p-4 transition-all duration-300 ease-out animate-fade-up`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">4. Método de pagamento</h3>
                </div>
                <div className="mt-3 grid gap-3">
                  <label className={`flex items-center justify-between rounded-md border px-3 py-3 ${selectedPayment === 'boleto' ? 'bg-slate-50' : ''}`}>
                    <div>
                      <div className="font-bold">Boleto</div>
                      <div className="text-sm text-slate-600">Pague em agências ou internet banking</div>
                    </div>
                    <input type="radio" name="pay" checked={selectedPayment === 'boleto'} onChange={() => setSelectedPayment('boleto')} />
                  </label>
                  <label className={`flex items-center justify-between rounded-md border px-3 py-3 ${selectedPayment === 'card' ? 'bg-slate-50' : ''}`}>
                    <div>
                      <div className="font-bold">Cartão de crédito</div>
                      <div className="text-sm text-slate-600">Parcelamento disponível</div>
                    </div>
                    <input type="radio" name="pay" checked={selectedPayment === 'card'} onChange={() => setSelectedPayment('card')} />
                  </label>
                  <label className={`flex items-center justify-between rounded-md border px-3 py-3 ${selectedPayment === 'pix' ? 'bg-slate-50' : ''}`}>
                    <div>
                      <div className="font-bold">Pix</div>
                      <div className="text-sm text-slate-600">Pagamento instantâneo</div>
                    </div>
                    <input type="radio" name="pay" checked={selectedPayment === 'pix'} onChange={() => setSelectedPayment('pix')} />
                  </label>

                  {/* Payment-specific details (visual only, optional) */}
                  {selectedPayment === 'card' && (
                    <div className="grid gap-2 transition-opacity duration-300">
                      <input className="rounded-md border border-slate-200 px-3 py-3" placeholder="Nome no cartão (opcional)" />
                      <input className="rounded-md border border-slate-200 px-3 py-3" placeholder="Número do cartão (opcional)" />
                      <div className="flex gap-2">
                        <input className="rounded-md border border-slate-200 px-3 py-3 flex-1" placeholder="MM/AA (opcional)" />
                        <input className="rounded-md border border-slate-200 px-3 py-3 w-28" placeholder="CVV (opcional)" />
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'boleto' && (
                    <div className="p-3 rounded-md bg-white/50 border transition-opacity duration-300">
                      <p className="text-sm text-slate-700">Ao finalizar será gerado um boleto (mock). Você poderá copiar o código de barras ou salvar o PDF.</p>
                      <button className="mt-3 rounded-md border px-4 py-2">Gerar boleto (mock)</button>
                    </div>
                  )}

                  {selectedPayment === 'pix' && (
                    <div className="p-3 rounded-md bg-white/50 border flex items-center gap-4 transition-opacity duration-300">
                      <div className="w-28 h-28 bg-slate-200 flex items-center justify-center">QR</div>
                      <div>
                        <div className="text-sm text-slate-700">Chave Pix: 000.000.000-00 (mock)</div>
                        <div className="text-xs text-slate-500">Abra seu app e utilize o QR ou copie a chave.</div>
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                    <div className="text-sm">Li e aceito os <a className="text-sky-700 font-bold" href="/terms.html" target="_blank" rel="noopener">Termos de Uso</a></div>
                  </label>

                    <div className="flex items-center gap-3">
                    <button className="rounded-full bg-blue-950 px-6 py-3 font-black text-white flex items-center gap-2" onClick={async () => {
                      if (!selectedPayment || !acceptedTerms) return
                      setOrderLoading(true)
                      try {
                        const shippingCost = shippingMethod === 'standard' ? 15 : 25
                        const total = cartSubtotal + shippingCost
                        const createMockOrder = () => new Promise<{ id: string; total: number }>((res) => setTimeout(() => res({ id: `PP-${Math.floor(Math.random() * 900000 + 100000)}`, total }), 700))
                        const result = await createMockOrder()
                        setOrderPlaced(result)
                        try {
                          sessionStorage.removeItem('cart')
                        } catch {
                          console.warn('Nao foi possivel limpar o carrinho no navegador.')
                        }
                        recordOrder(result.id, result.total)
                      } finally { setOrderLoading(false) }
                    }} disabled={!selectedPayment || !acceptedTerms || orderLoading}>
                      {orderLoading ? 'Processando...' : 'Finalizar pedido'}
                    </button>
                    <button className="rounded-full border px-6 py-3 font-black text-slate-700" onClick={() => setStep(3)}>Voltar</button>
                  </div>

                </div>
                </div>
              )}
            </div>

            {orderPlaced && (
              <div className="mt-6 rounded-lg border p-4 bg-green-50">
                <h3 className="font-black">Pedido confirmado</h3>
                <p className="mt-2">Número do pedido: <strong>{orderPlaced.id}</strong></p>
                <p className="mt-2">Total: <strong>{formatCurrency(orderPlaced.total)}</strong></p>
              </div>
            )}
          </section>

          <aside className="rounded-lg bg-slate-50 p-6">
            <h3 className="font-black">Resumo do pedido</h3>
            <div className="mt-4 space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-sm text-slate-600">Carrinho vazio.</p>
              ) : cartItems.map((it) => (
                <div key={it.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {it.image && <img src={it.image} alt="" className="h-12 w-12 object-contain rounded-md bg-white/50 p-1" />}
                    <div>
                      <div className="text-sm font-bold">{it.name}</div>
                      <div className="text-xs text-slate-600">x{it.quantity}</div>
                    </div>
                  </div>
                  <div className="font-black">{formatCurrency(parsePrice(it.price) * it.quantity)}</div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <strong className="text-slate-900">{formatCurrency(cartSubtotal)}</strong>
                </div>
                <div className="flex justify-between text-slate-700 mt-1">
                  <span>Frete</span>
                  <strong className="text-slate-900">{shippingMethod === 'standard' ? 'R$15,00' : 'R$25,00'}</strong>
                </div>
                <div className="flex justify-between text-slate-900 font-black mt-2">
                  <span>Total</span>
                  <strong>{formatCurrency(cartSubtotal + (shippingMethod === 'standard' ? 15 : 25))}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
