import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { BadgeCheck, BarChart3, ImageUp, Package, Percent, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import type { Product } from '../data/products'
import { productCatalog as initialCatalog } from '../data/products'
import { loadCoupons, saveCoupons } from '../data/coupons'
import type { Coupon } from '../data/coupons'
import { getAnalytics, getLastNDays, recordAdminLogin } from '../utils/analytics'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'T3mp!P@ssw0rd'
const ORDERS_KEY = 'pulse_orders'

type ProductOverrides = Record<string, Partial<Product> & { __deleted?: boolean }>
type AdminTab = 'overview' | 'orders' | 'coupons' | 'products'
type AdminOrder = {
  id: string
  total: number
  subtotal: number
  shipping: number
  discount: number
  couponCode?: string
  paymentMethod: string
  customer: {
    name?: string
    email: string
    phone?: string
    address?: { name: string; street: string; city: string; state: string; zip: string; phone: string }
  }
  items: Array<{ name: string; quantity: number }>
  status: string
  date: string
}

const emptyCoupon: Coupon = {
  code: '',
  type: 'percent',
  value: 10,
  active: true,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  minSubtotal: 0,
  description: '',
}

function loadOverrides(): ProductOverrides {
  try {
    const raw = localStorage.getItem('admin_products')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveOverrides(map: ProductOverrides) {
  localStorage.setItem('admin_products', JSON.stringify(map))
}

function loadOrders(): AdminOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Admin() {
  const [logged, setLogged] = useState<boolean>(sessionStorage.getItem('admin_logged') === '1')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [overrides, setOverrides] = useState<ProductOverrides>(loadOverrides())
  const [editing, setEditing] = useState<Product | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>(loadCoupons())
  const [couponDraft, setCouponDraft] = useState<Coupon>(emptyCoupon)
  const [orders, setOrders] = useState<AdminOrder[]>(loadOrders())
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d')

  const products = useMemo(() => {
    const merged = initialCatalog.map((product) => ({ ...product, ...(overrides[product.id] || {}) }))
    const extra = Object.keys(overrides)
      .filter((id) => !merged.find((product) => product.id === id))
      .map((id) => ({ id, ...overrides[id] } as Product))
    return [...merged, ...extra].filter((product) => !overrides[product.id]?.__deleted)
  }, [overrides])

  const analytics = getAnalytics()
  const now = Date.now()
  const periodMs = period === '24h' ? 86_400_000 : period === '7d' ? 604_800_000 : period === '30d' ? 2_592_000_000 : Infinity
  const periodOrders = orders.filter((order) => period === 'all' || now - new Date(order.date).getTime() <= periodMs)
  const revenue = periodOrders.reduce((total, order) => total + order.total, 0)
  const topProducts = Object.entries(analytics.productViews)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
    .map(([id, views]) => ({ product: initialCatalog.find((item) => item.id === id)?.name ?? id, views }))

  function doLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('admin_logged', '1')
      setLogged(true)
      recordAdminLogin()
      return
    }
    alert('Credenciais inválidas')
  }

  function doLogout() {
    sessionStorage.removeItem('admin_logged')
    setLogged(false)
    window.history.pushState(null, '', '/')
  }

  function upsertProduct(product: Product) {
    const map = { ...overrides }
    map[product.id] = { ...(map[product.id] || {}), ...product, __deleted: false }
    setOverrides(map)
    saveOverrides(map)
    setEditing(null)
  }

  function removeProduct(id: string) {
    const map = { ...overrides }
    map[id] = { ...(map[id] || {}), __deleted: true }
    setOverrides(map)
    saveOverrides(map)
  }

  function upsertCoupon() {
    const code = couponDraft.code.trim().toUpperCase()
    if (!code || couponDraft.value <= 0 || !couponDraft.expiresAt) return
    const nextCoupon = { ...couponDraft, code, minSubtotal: Number(couponDraft.minSubtotal || 0), value: Number(couponDraft.value) }
    const nextCoupons = coupons.some((coupon) => coupon.code === code)
      ? coupons.map((coupon) => (coupon.code === code ? nextCoupon : coupon))
      : [nextCoupon, ...coupons]
    setCoupons(nextCoupons)
    saveCoupons(nextCoupons)
    setCouponDraft(emptyCoupon)
  }

  function removeCoupon(code: string) {
    const nextCoupons = coupons.filter((coupon) => coupon.code !== code)
    setCoupons(nextCoupons)
    saveCoupons(nextCoupons)
  }

  function attachProductImage(file: File) {
    if (!editing || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setEditing({ ...editing, image: String(reader.result), gallery: [String(reader.result), ...(editing.gallery ?? [])] } as Product)
    reader.readAsDataURL(file)
  }

  if (!logged) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <form className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl animate-fade-up" onSubmit={doLogin}>
          <span className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-xs font-black uppercase text-blue-950">Área restrita</span>
          <h1 className="mt-5 text-3xl font-black">Dashboard Pulsepro</h1>
          <p className="mt-2 text-sm text-slate-600">Gerencie pedidos, cupons e produtos antes da integração com banco de dados.</p>
          <input className="mt-6 w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="Usuário" value={user} onChange={(event) => setUser(event.target.value)} />
          <input className="mt-3 w-full rounded-2xl border px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="Senha" type="password" value={pass} onChange={(event) => setPass(event.target.value)} />
          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-full bg-blue-950 py-3 font-black uppercase text-white hover:bg-sky-800">Entrar</button>
            <button type="button" className="rounded-full border px-4 py-3 font-black" onClick={() => { setUser(ADMIN_USER); setPass(ADMIN_PASS) }}>Preencher</button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-blue-950 p-6 text-white shadow-xl shadow-blue-950/15 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">Pulsepro Admin</p>
            <h1 className="mt-2 text-3xl font-black">Dashboard operacional</h1>
            <p className="mt-2 text-cyan-50">Pronto para plugar API, banco de dados e gateway de pagamento.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-5 py-3 font-black uppercase text-blue-950" onClick={() => setOrders(loadOrders())}>Atualizar</button>
            <button className="rounded-full border border-white/30 px-5 py-3 font-black uppercase text-white" onClick={doLogout}>Sair</button>
          </div>
        </header>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-2">
          <TabButton active={activeTab === 'overview'} icon={<BarChart3 className="size-4" />} label="Visão geral" onClick={() => setActiveTab('overview')} />
          <TabButton active={activeTab === 'orders'} icon={<ShoppingBag className="size-4" />} label="Pedidos" onClick={() => setActiveTab('orders')} />
          <TabButton active={activeTab === 'coupons'} icon={<Percent className="size-4" />} label="Cupons" onClick={() => setActiveTab('coupons')} />
          <TabButton active={activeTab === 'products'} icon={<Package className="size-4" />} label="Produtos" onClick={() => setActiveTab('products')} />
        </nav>

        {activeTab === 'overview' && (
          <section className="mt-6 grid gap-5">
            <div className="grid gap-4 md:grid-cols-4">
              <Metric title="Visitas" value={analytics.totals.visits.toString()} />
              <Metric title="Pedidos" value={periodOrders.length.toString()} />
              <Metric title="Receita" value={formatCurrency(revenue)} />
              <Metric title="Cupons ativos" value={coupons.filter((coupon) => coupon.active).length.toString()} />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['24h', '24 horas'],
                ['7d', '7 dias'],
                ['30d', '30 dias'],
                ['all', 'Tudo'],
              ].map(([value, label]) => (
                <button key={value} className={`${period === value ? 'bg-blue-950 text-white' : 'bg-white text-slate-700'} rounded-full px-4 py-2 text-sm font-black uppercase shadow-sm`} onClick={() => setPeriod(value as typeof period)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="font-black">Visitas recentes</h2>
                <div className="mt-5 flex h-48 items-end gap-3 overflow-hidden">
                  {getLastNDays(period === '30d' ? 30 : 7).map((day) => {
                    const maxVisits = Math.max(...getLastNDays(period === '30d' ? 30 : 7).map((item) => item.visits), 1)
                    return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-xl bg-cyan-400" style={{ height: `${Math.max(8, (day.visits / maxVisits) * 170)}px` }} />
                      <span className="text-xs text-slate-500">{day.date.slice(5)}</span>
                    </div>
                  )})}
                </div>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="font-black">Produtos mais vistos</h2>
                <div className="mt-4 grid gap-3">
                  {topProducts.length === 0 ? <p className="text-sm text-slate-500">Ainda sem visualizações registradas.</p> : topProducts.map((item) => (
                    <div key={item.product} className="flex justify-between rounded-2xl bg-slate-50 p-3 text-sm">
                      <span>{item.product}</span>
                      <strong>{item.views}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Pedidos registrados</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-3">Pedido</th>
                    <th>Cliente</th>
                    <th>Itens</th>
                    <th>Cupom</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="py-4 font-black">{order.id}</td>
                      <td>
                        <strong className="block">{order.customer.name ?? order.customer.email}</strong>
                        <span className="text-slate-500">{order.customer.email}</span>
                      </td>
                      <td>{order.items.reduce((total, item) => total + item.quantity, 0)}</td>
                      <td>{order.couponCode ?? '-'}</td>
                      <td className="font-black">{formatCurrency(order.total)}</td>
                      <td><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700">{order.status}</span></td>
                      <td>{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="py-8 text-center text-slate-500">Nenhum pedido salvo ainda.</p>}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {orders.map((order) => (
                <article key={`${order.id}-address`} className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <h3 className="font-black">{order.id} — Envio</h3>
                  <p className="mt-2">{order.customer.address?.name ?? order.customer.name}</p>
                  <p>{order.customer.address?.street}</p>
                  <p>{order.customer.address?.city} / {order.customer.address?.state} — {order.customer.address?.zip}</p>
                  <p>Telefone: {order.customer.address?.phone ?? order.customer.phone}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'coupons' && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Criar ou editar cupom</h2>
              <div className="mt-5 grid gap-3">
                <input className="rounded-2xl border px-4 py-3 uppercase" placeholder="Código do cupom" value={couponDraft.code} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, code: event.target.value.toUpperCase() }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select className="rounded-2xl border px-4 py-3" value={couponDraft.type} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, type: event.target.value as Coupon['type'] }))}>
                    <option value="percent">Porcentagem</option>
                    <option value="fixed">Valor fixo</option>
                  </select>
                  <input className="rounded-2xl border px-4 py-3" type="number" min="1" value={couponDraft.value} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, value: Number(event.target.value) }))} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="rounded-2xl border px-4 py-3" type="date" value={couponDraft.expiresAt} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, expiresAt: event.target.value }))} />
                  <input className="rounded-2xl border px-4 py-3" type="number" min="0" placeholder="Compra mínima" value={couponDraft.minSubtotal ?? 0} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, minSubtotal: Number(event.target.value) }))} />
                </div>
                <textarea className="rounded-2xl border px-4 py-3" placeholder="Descrição interna" value={couponDraft.description} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, description: event.target.value }))} />
                <label className="flex items-center gap-3 font-bold">
                  <input type="checkbox" checked={couponDraft.active} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, active: event.target.checked }))} />
                  Cupom ativo
                </label>
                <label className="flex items-center gap-3 font-bold">
                  <input type="checkbox" checked={Boolean(couponDraft.oncePerCustomer)} onChange={(event) => setCouponDraft((coupon) => ({ ...coupon, oncePerCustomer: event.target.checked }))} />
                  Uso unico por cliente
                </label>
                <button className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-950 px-6 py-3 font-black uppercase text-white" onClick={upsertCoupon}>
                  <Plus className="size-4" />
                  Salvar cupom
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Cupons cadastrados</h2>
              <div className="mt-5 grid gap-3">
                {coupons.map((coupon) => (
                  <article key={coupon.code} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{coupon.code}</h3>
                        <p className="text-sm text-slate-600">{coupon.description || 'Sem descrição'}</p>
                      </div>
                      <span className={`${coupon.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} rounded-full px-3 py-1 text-xs font-black uppercase`}>
                        {coupon.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                      <span>Desconto: <strong>{coupon.type === 'percent' ? `${coupon.value}%` : formatCurrency(coupon.value)}</strong></span>
                      <span>Mínimo: <strong>{formatCurrency(coupon.minSubtotal ?? 0)}</strong></span>
                      <span>Expira: <strong>{new Date(`${coupon.expiresAt}T12:00:00`).toLocaleDateString('pt-BR')}</strong></span>
                      <span>Regra: <strong>{coupon.oncePerCustomer ? '1 por cliente' : 'Livre'}</strong></span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="rounded-full border px-4 py-2 text-sm font-black" onClick={() => setCouponDraft(coupon)}>Editar</button>
                      <button className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white" onClick={() => removeCoupon(coupon.code)}>
                        <Trash2 className="size-4" />
                        Remover
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Produtos ({products.length})</h2>
              <div className="mt-5 grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <img src={(product.gallery && product.gallery[0]) || product.image} alt="" className="size-16 rounded-2xl bg-slate-50 object-contain p-1" />
                      <div>
                        <div className="font-black">{product.name}</div>
                        <div className="text-sm text-slate-600">{product.price} — {product.category}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full border px-4 py-2 text-sm font-black" onClick={() => setEditing(product)}>Editar</button>
                      <button className="rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white" onClick={() => removeProduct(product.id)}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black">Produto</h3>
              <button className="mt-4 w-full rounded-full bg-cyan-500 px-4 py-3 font-black uppercase text-blue-950" onClick={() => setEditing({ id: `novo-${Date.now()}`, name: '', price: 'R$0,00', image: '', category: 'Performance e energia' } as Product)}>
                Novo produto
              </button>
              <p className="mt-3 text-sm text-slate-600">Essas alterações ficam locais até conectar o banco de dados.</p>
            </aside>

            {editing && (
              <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
                <h3 className="text-xl font-black">{editing.id.includes('novo-') ? 'Criar' : 'Editar'} produto</h3>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <input className="rounded-2xl border px-4 py-3" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value } as Product)} placeholder="Nome" />
                  <input className="rounded-2xl border px-4 py-3" value={editing.price} onChange={(event) => setEditing({ ...editing, price: event.target.value } as Product)} placeholder="Preço" />
                  <input className="rounded-2xl border px-4 py-3" value={editing.category || ''} onChange={(event) => setEditing({ ...editing, category: event.target.value } as Product)} placeholder="Categoria" />
                  <input className="rounded-2xl border px-4 py-3" value={editing.tag || ''} onChange={(event) => setEditing({ ...editing, tag: event.target.value } as Product)} placeholder="Tag" />
                  <input className="rounded-2xl border px-4 py-3 md:col-span-2" value={editing.image || ''} onChange={(event) => setEditing({ ...editing, image: event.target.value } as Product)} placeholder="URL/import da imagem" />
                  <label
                    className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50 p-5 text-center font-bold text-blue-950 md:col-span-2"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      const file = event.dataTransfer.files[0]
                      if (file) attachProductImage(file)
                    }}
                  >
                    <ImageUp className="size-8" aria-hidden="true" />
                    Arraste uma imagem ou clique para escolher da galeria
                    <input className="sr-only" type="file" accept="image/*" onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) attachProductImage(file)
                    }} />
                  </label>
                  {editing.image && <img className="max-h-52 rounded-2xl border bg-slate-50 object-contain p-3 md:col-span-2" src={editing.image} alt="Prévia do produto" />}
                  <textarea className="rounded-2xl border px-4 py-3 md:col-span-2" rows={4} value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value } as Product)} placeholder="Descrição" />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-full bg-blue-950 px-6 py-3 font-black uppercase text-white" onClick={() => upsertProduct(editing)}>
                    <BadgeCheck className="size-4" />
                    Salvar produto
                  </button>
                  <button className="rounded-full border px-6 py-3 font-black uppercase" onClick={() => setEditing(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase text-slate-500">{title}</p>
      <strong className="mt-3 block text-3xl font-black">{value}</strong>
    </div>
  )
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={`${active ? 'bg-blue-950 text-white' : 'bg-white text-slate-700'} inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-black uppercase shadow-sm transition hover:bg-blue-950 hover:text-white`} onClick={onClick}>
      {icon}
      {label}
    </button>
  )
}
