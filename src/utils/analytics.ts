const KEY = 'analytics_v1'

type DailyBucket = { visits: number; orders: number }

type AnalyticsStore = {
  daily: Record<string, DailyBucket>
  totals: { visits: number; orders: number; revenue: number }
  productViews: Record<string, number>
  lastOrders: Array<{ id: string; total: number; date: string }>
  adminLogins: number
}

function load(): AnalyticsStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    return { daily: {}, totals: { visits: 0, orders: 0, revenue: 0 }, productViews: {}, lastOrders: [], adminLogins: 0 }
  }
  return { daily: {}, totals: { visits: 0, orders: 0, revenue: 0 }, productViews: {}, lastOrders: [], adminLogins: 0 }
}

function save(store: AnalyticsStore) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    console.warn('Nao foi possivel salvar as metricas no navegador.')
  }
}

function todayKey() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function recordVisit() {
  const s = load()
  const k = todayKey()
  s.daily[k] = s.daily[k] || { visits: 0, orders: 0 }
  s.daily[k].visits += 1
  s.totals.visits += 1
  save(s)
}

export function recordProductView(id: string) {
  const s = load()
  s.productViews[id] = (s.productViews[id] || 0) + 1
  save(s)
}

export function recordOrder(id: string, total: number) {
  const s = load()
  const k = todayKey()
  s.daily[k] = s.daily[k] || { visits: 0, orders: 0 }
  s.daily[k].orders += 1
  s.totals.orders += 1
  s.totals.revenue += total
  s.lastOrders.unshift({ id, total, date: new Date().toISOString() })
  if (s.lastOrders.length > 50) s.lastOrders.pop()
  save(s)
}

export function recordAdminLogin() {
  const s = load()
  s.adminLogins = (s.adminLogins || 0) + 1
  save(s)
}

export function getAnalytics() {
  return load()
}

export function getLastNDays(n = 7) {
  const s = load()
  const days: Array<{ date: string; visits: number; orders: number }> = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const k = d.toISOString().slice(0, 10)
    const bucket = s.daily[k] || { visits: 0, orders: 0 }
    days.push({ date: k, visits: bucket.visits, orders: bucket.orders })
  }
  return days
}

export default { recordVisit, recordOrder, recordProductView, getAnalytics, getLastNDays, recordAdminLogin }
