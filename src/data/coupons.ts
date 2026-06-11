export type Coupon = {
  code: string
  type: 'percent' | 'fixed'
  value: number
  active: boolean
  expiresAt: string
  minSubtotal?: number
  oncePerCustomer?: boolean
  description?: string
}

export type CouponResult = {
  coupon: Coupon | null
  discount: number
  message: string
  valid: boolean
}

const COUPONS_KEY = 'pulse_coupons'

export const defaultCoupons: Coupon[] = [
  {
    code: 'PULSE10',
    type: 'percent',
    value: 10,
    active: true,
    expiresAt: '2026-12-31',
    minSubtotal: 80,
    oncePerCustomer: true,
    description: '10% de desconto em compras acima de R$80,00.',
  },
  {
    code: 'BEMVINDO20',
    type: 'fixed',
    value: 20,
    active: true,
    expiresAt: '2026-12-31',
    minSubtotal: 120,
    oncePerCustomer: true,
    description: 'R$20,00 de desconto para primeira compra.',
  },
]

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}

export function loadCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(COUPONS_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(COUPONS_KEY, JSON.stringify(defaultCoupons))
  } catch {
    console.warn('Nao foi possivel carregar os cupons.')
  }
  return defaultCoupons
}

export function saveCoupons(coupons: Coupon[]) {
  try {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons))
  } catch {
    console.warn('Nao foi possivel salvar os cupons.')
  }
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number) {
  if (coupon.type === 'percent') {
    return Math.min(subtotal, (subtotal * coupon.value) / 100)
  }

  return Math.min(subtotal, coupon.value)
}

export function validateCoupon(code: string, subtotal: number, now = new Date()): CouponResult {
  const normalizedCode = normalizeCouponCode(code)
  const coupon = loadCoupons().find((item) => normalizeCouponCode(item.code) === normalizedCode) ?? null

  if (!coupon) {
    return { coupon: null, discount: 0, message: 'Cupom nao encontrado.', valid: false }
  }

  if (!coupon.active) {
    return { coupon, discount: 0, message: 'Este cupom esta desativado.', valid: false }
  }

  const expiresAt = new Date(`${coupon.expiresAt}T23:59:59`)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
    return { coupon, discount: 0, message: 'Este cupom expirou.', valid: false }
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return { coupon, discount: 0, message: `Compra minima de ${coupon.minSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`, valid: false }
  }

  const discount = calculateCouponDiscount(coupon, subtotal)
  return { coupon, discount, message: `Cupom ${coupon.code} aplicado com sucesso.`, valid: true }
}
