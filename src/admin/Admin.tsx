import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Product } from '../data/products'
import { productCatalog as initialCatalog } from '../data/products'
import { getAnalytics, getLastNDays, recordAdminLogin } from '../utils/analytics'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'T3mp!P@ssw0rd'

type ProductOverrides = Record<string, Partial<Product> & { __deleted?: boolean }>

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

export default function Admin() {
  const [logged, setLogged] = useState<boolean>(sessionStorage.getItem('admin_logged') === '1')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [overrides, setOverrides] = useState<ProductOverrides>(loadOverrides())
  const [editing, setEditing] = useState<Product | null>(null)

  const products = useMemo(() => {
    const merged = initialCatalog.map((p) => ({ ...p, ...(overrides[p.id] || {}) }))
    const extra = Object.keys(overrides)
      .filter((id) => !merged.find((m) => m.id === id))
      .map((id) => ({ id, ...overrides[id] } as Product))
    return [...merged, ...extra]
  }, [overrides])

  function doLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('admin_logged', '1')
      setLogged(true)
      recordAdminLogin()
    } else {
      alert('Credenciais inválidas')
    }
  }

  function doLogout() {
    sessionStorage.removeItem('admin_logged')
    setLogged(false)
    // navigate back to home path
    window.history.pushState(null, '', '/')
  }

  function upsertProduct(prod: Product) {
    const map = { ...overrides }
    map[prod.id] = { ...(map[prod.id] || {}), ...prod }
    setOverrides(map)
    saveOverrides(map)
    setEditing(null)
  }

  function removeProduct(id: string) {
    const map = { ...overrides }
    // mark deletion by setting a __deleted flag
    map[id] = { ...(map[id] || {}), __deleted: true }
    setOverrides(map)
    saveOverrides(map)
  }

  if (!logged) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <form className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg animate-fade-up" onSubmit={doLogin}>
          <h1 className="mb-4 text-2xl font-black">Painel Admin</h1>
          <p className="mb-4 text-sm text-slate-600">Acesse com seu usuário administrativo.</p>
          <input className="w-full mb-3 rounded border px-3 py-2" placeholder="Usuário" value={user} onChange={(e) => setUser(e.target.value)} />
          <input className="w-full mb-4 rounded border px-3 py-2" placeholder="Senha" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          <div className="flex gap-3">
            <button className="flex-1 rounded bg-blue-800 py-2 text-white hover:bg-blue-900">Entrar</button>
            <button type="button" className="rounded border px-4 py-2" onClick={() => { setUser('admin'); setPass('T3mp!P@ssw0rd') }}>Preencher</button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Painel Admin</h1>
          <div className="flex items-center gap-3">
            <button className="rounded bg-red-600 px-4 py-2 text-white" onClick={doLogout}>Sair</button>
          </div>
        </header>

        {/* Analytics overview */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4 shadow-sm">
            <h4 className="font-bold">Métricas rápidas</h4>
            <div className="mt-3 text-sm text-slate-700">
              {(() => {
                const a = getAnalytics()
                return (
                  <div className="space-y-2">
                    <div><strong>Total visitas:</strong> {a.totals.visits}</div>
                    <div><strong>Total pedidos:</strong> {a.totals.orders}</div>
                    <div><strong>Receita (mock):</strong> R${(a.totals.revenue || 0).toFixed(2).replace('.', ',')}</div>
                    <div><strong>Logins admin:</strong> {a.adminLogins || 0}</div>
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="md:col-span-2 rounded-lg border p-4 shadow-sm">
            <h4 className="font-bold">Últimos 7 dias</h4>
            <div className="mt-3">
              {(() => {
                const days = getLastNDays(7)
                const maxVisits = Math.max(...days.map((d) => d.visits), 1)
                return (
                  <svg viewBox={`0 0 ${days.length * 28} 80`} className="w-full h-20">
                    {days.map((d, i) => {
                      const h = Math.round((d.visits / maxVisits) * 60)
                      return (
                        <g key={d.date} transform={`translate(${i * 28},0)`}> 
                          <rect x={6} y={70 - h} width={12} height={h} fill="#0ea5e9" rx={3} />
                          <text x={12} y={78} fontSize={10} textAnchor="middle" fill="#334155">{d.date.slice(5)}</text>
                        </g>
                      )
                    })}
                  </svg>
                )
              })()}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold mb-4">Produtos ({products.length})</h2>
            <div className="grid gap-4">
              {products.map((p) => (
                // hide deleted
                overrides[p.id]?.__deleted ? null : (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-lg border p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <img src={(p.gallery && p.gallery[0]) || p.image} alt="" className="h-16 w-16 rounded object-contain" />
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-sm text-slate-600">{p.price} — {p.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded border px-3 py-1 text-sm" onClick={() => setEditing(p)}>Editar</button>
                    <button className="rounded bg-red-600 px-3 py-1 text-sm text-white" onClick={() => removeProduct(p.id)}>Remover</button>
                  </div>
                </div>
                )
              ))}
            </div>
          </div>

          <aside className="rounded-lg border p-4 shadow-sm">
            <h3 className="font-bold mb-3">Criar produto</h3>
            <button className="w-full rounded bg-cyan-600 px-3 py-2 text-white" onClick={() => setEditing({ id: `novo-${Date.now()}`, name: '', price: 'R$0,00', image: '' } as Product)}>Novo produto</button>
            <p className="mt-3 text-sm text-slate-600">As alterações são salvas no seu navegador (localStorage) e refletem na loja localmente.</p>
          </aside>
        </section>

        {editing && (
          <div className="mt-6 rounded-lg border p-6 shadow-lg animate-fade-up">
            <h3 className="text-lg font-bold mb-4">{editing.id.includes('novo-') ? 'Criar' : 'Editar'} produto</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded border px-3 py-2" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value } as Product)} placeholder="Nome" />
              <input className="rounded border px-3 py-2" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value } as Product)} placeholder="Preco (ex: R$99,90)" />
              <input className="rounded border px-3 py-2" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value } as Product)} placeholder="Categoria" />
              <input className="rounded border px-3 py-2" value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value } as Product)} placeholder="URL da imagem (produtos)" />
              <textarea className="md:col-span-2 rounded border px-3 py-2" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value } as Product)} placeholder="Descricao" />
            </div>
            <div className="mt-4 flex gap-3">
              <button className="rounded bg-green-600 px-4 py-2 text-white" onClick={() => upsertProduct(editing as Product)}>Salvar</button>
              <button className="rounded border px-4 py-2" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
