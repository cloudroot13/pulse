export type CustomerAddress = {
  name: string
  street: string
  city: string
  state: string
  zip: string
  phone: string
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  password: string
  address: CustomerAddress
  usedCoupons: string[]
  createdAt: string
}

const CUSTOMERS_KEY = 'pulse_customers'
const CURRENT_CUSTOMER_KEY = 'pulse_current_customer'

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeWrite<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn(`Nao foi possivel salvar ${key}.`)
  }
}

export function loadCustomers() {
  return safeRead<Customer[]>(CUSTOMERS_KEY, [])
}

export function getCurrentCustomer() {
  const currentId = safeRead<string | null>(CURRENT_CUSTOMER_KEY, null)
  if (!currentId) return null
  return loadCustomers().find((customer) => customer.id === currentId) ?? null
}

export function registerCustomer(input: Omit<Customer, 'id' | 'usedCoupons' | 'createdAt'>) {
  const customers = loadCustomers()
  const normalizedEmail = input.email.trim().toLowerCase()
  const existing = customers.find((customer) => customer.email.toLowerCase() === normalizedEmail)
  const customer: Customer = {
    ...(existing ?? { id: crypto.randomUUID(), usedCoupons: [], createdAt: new Date().toISOString() }),
    ...input,
    email: normalizedEmail,
  }
  const nextCustomers = existing
    ? customers.map((item) => (item.id === existing.id ? customer : item))
    : [customer, ...customers]
  safeWrite(CUSTOMERS_KEY, nextCustomers)
  safeWrite(CURRENT_CUSTOMER_KEY, customer.id)
  return customer
}

export function loginCustomer(email: string, password: string) {
  const customer = loadCustomers().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
  if (!customer) return null
  safeWrite(CURRENT_CUSTOMER_KEY, customer.id)
  return customer
}

export function logoutCustomer() {
  try {
    localStorage.removeItem(CURRENT_CUSTOMER_KEY)
  } catch {
    console.warn('Nao foi possivel sair da conta.')
  }
}

export function updateCustomer(customer: Customer) {
  const nextCustomers = loadCustomers().map((item) => (item.id === customer.id ? customer : item))
  safeWrite(CUSTOMERS_KEY, nextCustomers)
  safeWrite(CURRENT_CUSTOMER_KEY, customer.id)
  return customer
}

export function markCouponAsUsed(customerId: string, couponCode: string) {
  const customers = loadCustomers()
  const nextCustomers = customers.map((customer) => {
    if (customer.id !== customerId) return customer
    return {
      ...customer,
      usedCoupons: Array.from(new Set([...customer.usedCoupons, couponCode.toUpperCase()])),
    }
  })
  safeWrite(CUSTOMERS_KEY, nextCustomers)
}
