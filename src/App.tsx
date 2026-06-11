import { useEffect, useState, useRef } from 'react'
import CheckoutPage from './Checkout'
import logoPulsepro from './assets/Logo-PulsePro.webp'
import bannerWellness from './assets/banners/Captura de Tela 2026-05-30 às 14.25.08.png'
import bannerPerformance from './assets/banners/Captura de Tela 2026-05-30 às 14.25.22.png'
import bannerMobile from './assets/banners/banner_v2.jpeg'
import octogonoBackground from './assets/banners/octogono.png'
import belezaKitImg from './assets/produtos/beleza/Pulsepro_Prancheta-2.webp'
import pagamentosIcon from './assets/icons/pagamentos.webp'
import siteblindadoIcon from './assets/icons/siteblindado.png'
import {
  categoryCarouselItems,
  combos,
  featuredProducts,
  homeShowcaseProducts,
  performanceProductOrder,
  productCatalog,
  routineProductOrder,
} from './data/products'
import type { Product } from './data/products'
import {
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Lock,
  Leaf,
  LockKeyhole,
  Mail,
  Minus,
  Menu,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import { generateSmartDescription, generateSmartShort } from './data/products'
import Admin from './admin/Admin'
import { recordVisit, recordProductView } from './utils/analytics'

type CartItem = Product & {
  quantity: number
}

function WhatsAppIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M16.04 3C8.92 3 3.14 8.74 3.14 15.8c0 2.26.6 4.46 1.74 6.4L3 29l6.98-1.82a13.03 13.03 0 0 0 6.06 1.52c7.12 0 12.9-5.74 12.9-12.8S23.16 3 16.04 3Zm0 23.54c-1.9 0-3.75-.5-5.38-1.46l-.39-.23-4.14 1.08 1.1-4.01-.26-.42a10.55 10.55 0 0 1-1.63-5.7c0-5.87 4.8-10.64 10.7-10.64 5.9 0 10.7 4.77 10.7 10.64 0 5.87-4.8 10.74-10.7 10.74Zm5.86-7.96c-.32-.16-1.9-.93-2.2-1.04-.3-.1-.52-.16-.74.16-.22.32-.85 1.04-1.04 1.25-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.85-1.6-1.9-1.8-2.22-.18-.32-.02-.5.14-.66.14-.14.32-.38.48-.56.16-.18.22-.32.32-.54.1-.22.05-.4-.03-.56-.08-.16-.74-1.78-1.02-2.44-.27-.64-.55-.55-.74-.56h-.63c-.22 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.7s1.16 3.13 1.32 3.35c.16.22 2.28 3.46 5.54 4.86.77.33 1.38.53 1.85.68.78.25 1.48.21 2.04.13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.4.19-1.52-.08-.13-.3-.21-.62-.37Z" />
    </svg>
  )
}




const testimonials = [
  {
    text: 'A creatina gummy ficou perfeita para minha rotina. Levo na bolsa, tomo sem complicação e senti melhora nos treinos.',
    name: 'Solange Dias',
    detail: 'Cliente Pulsepro',
    photo: 'https://i.pravatar.cc/160?img=47',
  },
  {
    text: 'O Pulse Flex me ajudou muito no dia a dia. A experiência de compra foi rápida e o produto chegou bem embalado.',
    name: 'Rafael Monteiro',
    detail: 'Compra verificada',
    photo: 'https://i.pravatar.cc/160?img=12',
  },
  {
    text: 'Gostei da apresentação da marca e da confiança das informações. Parece uma loja séria, moderna e fácil de comprar.',
    name: 'Carlos Antônio',
    detail: 'Cliente recorrente',
    photo: 'https://i.pravatar.cc/160?img=68',
  },
  {
    text: 'Comprei o kit de gummies e achei a apresentação muito profissional. O site passa segurança e deixa tudo fácil de entender.',
    name: 'Marina Lopes',
    detail: 'Compra em combo',
    photo: 'https://i.pravatar.cc/160?img=32',
  },
  {
    text: 'O pré-treino me acompanha nos dias mais puxados. Gostei de ver os benefícios separados, ajuda muito na decisão.',
    name: 'Bruno Martins',
    detail: 'Atleta amador',
    photo: 'https://i.pravatar.cc/160?img=59',
  },
  {
    text: 'A seção de segurança e os depoimentos fazem diferença. Dá vontade de continuar navegando e conhecer outros produtos.',
    name: 'Patrícia Nunes',
    detail: 'Cliente nova',
    photo: 'https://i.pravatar.cc/160?img=44',
  },
]

const loopingTestimonials = [...testimonials, ...testimonials]
const benefitTicker = ['Creatina', 'Pre-treino', 'Colageno', 'Melatonina', 'Beleza', 'Mobilidade', 'Foco', 'Energia']
const bannerSlides = [bannerPerformance, bannerWellness]
const categorySlugs: Record<string, string> = {
  Todos: 'todos',
  'Performance e energia': 'performance-e-energia',
  'Rotina e bem-estar': 'rotina-e-bem-estar',
  Beleza: 'beleza',
}
const navigationLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Produtos', href: '/produtos' },
  { label: 'Combos', href: '/combos' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Contato', href: '/contato' },
]

const parsePrice = (price: string) => Number(price.replace('R$', '').replace(/\./g, '').replace(',', '.'))
const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const getProductOrder = (order: string[], id: string) => {
  const index = order.indexOf(id)

  return index === -1 ? order.length : index
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false)
  const [accountMode, setAccountMode] = useState<'login' | 'register'>('login')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [categoryStartIndex, setCategoryStartIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [categoryPage, setCategoryPage] = useState<string | null>(null)
  const [staticPage, setStaticPage] = useState<'sobre' | 'contato' | null>(null)
  const [combosPage, setCombosPage] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [bannerIndex, setBannerIndex] = useState(0)
  const [mobileBannerIndex, setMobileBannerIndex] = useState(0)
  const mobileBannerSlides = [bannerMobile, bannerWellness]
  const touchStartX = useRef<number | null>(null)

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [routeHash, setRouteHash] = useState<string>(window.location.hash || '')
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [shippingAddress, setShippingAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '' })
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'boleto' | 'pix'>('card')
  const [orderPlaced, setOrderPlaced] = useState<{ id: string; total: number } | null>(null)
  const [sortOrder, setSortOrder] = useState('padrao')

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0)
  const orderedCategories = categoryCarouselItems.map((_, index) => categoryCarouselItems[(categoryStartIndex + index) % categoryCarouselItems.length])
  const filteredProducts = productCatalog.filter((product) => {
    if (activeCategory === 'Todos') {
      return true
    }

    if (activeCategory === 'Performance e energia') {
      return product.category === activeCategory || product.tag === 'Performance' || product.tag === 'Foco'
    }

    if (activeCategory === 'Rotina e bem-estar') {
      return product.category === activeCategory || product.tag === 'Bem-estar' || product.tag === 'Sono'
    }

    return product.category === activeCategory || product.tag === activeCategory
  })
  const sortedProducts = [...filteredProducts].sort((firstProduct, secondProduct) => {
    if (sortOrder === 'padrao' && activeCategory === 'Rotina e bem-estar') {
      return getProductOrder(routineProductOrder, firstProduct.id) - getProductOrder(routineProductOrder, secondProduct.id)
    }

    if (sortOrder === 'padrao' && activeCategory === 'Performance e energia') {
      return getProductOrder(performanceProductOrder, firstProduct.id) - getProductOrder(performanceProductOrder, secondProduct.id)
    }

    if (sortOrder === 'menor-preco') {
      return parsePrice(firstProduct.price) - parsePrice(secondProduct.price)
    }

    if (sortOrder === 'maior-preco') {
      return parsePrice(secondProduct.price) - parsePrice(firstProduct.price)
    }

    if (sortOrder === 'ofertas') {
      return Number(Boolean(secondProduct.oldPrice)) - Number(Boolean(firstProduct.oldPrice))
    }

    return 0
  })

  const addToCart = (product: Product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.name === product.name)

      if (existingItem) {
        return items.map((item) => (item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item))
      }

      return [...items, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const updateCartQuantity = (productName: string, change: number) => {
    setCartItems((items) =>
      items
        .map((item) => (item.name === productName ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const showNextCategory = () => {
    setCategoryStartIndex((index) => (index + 1) % categoryCarouselItems.length)
  }

  const showPreviousCategory = () => {
    setCategoryStartIndex((index) => (index - 1 + categoryCarouselItems.length) % categoryCarouselItems.length)
  }

  const navigateHome = () => {
    setSelectedProduct(null)
    setCategoryPage(null)
    setStaticPage(null)
    setCombosPage(false)
    setIsMenuOpen(false)
    window.history.pushState(null, '', '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToProductsPage = () => {
    setSelectedProduct(null)
    setCategoryPage('Todos')
    setStaticPage(null)
    setCombosPage(false)
    setIsMenuOpen(false)
    setActiveCategory('Todos')
    window.history.pushState(null, '', '/produtos')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToCombosPage = () => {
    setSelectedProduct(null)
    setCategoryPage(null)
    setStaticPage(null)
    setCombosPage(true)
    setIsMenuOpen(false)
    window.history.pushState(null, '', '/combos')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToHomeSection = (sectionId?: string) => {
    setSelectedProduct(null)
    setCategoryPage(null)
    setStaticPage(null)
    setIsMenuOpen(false)
    // Use hash navigation to ensure scrolling works from any route (including checkout)
    if (sectionId) {
      window.location.hash = sectionId
    } else {
      window.location.hash = ''
      window.history.pushState(null, '', '/')
    }

    window.setTimeout(() => {
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const openProduct = (product: Product) => {
    setSelectedProduct(product)
    setCategoryPage(null)
    setStaticPage(null)
    setIsImageZoomOpen(false)
    setIsMenuOpen(false)
    window.history.pushState(null, '', `/produto/${product.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try { recordProductView(product.id) } catch (e) {}
  }

  const closeProduct = () => {
    navigateHome()
  }

  const openCategory = (category: string) => {
    setActiveCategory(category)
    setCategoryPage(category)
    setSelectedProduct(null)
    setStaticPage(null)
    setIsMenuOpen(false)
    window.history.pushState(null, '', `/categoria/${categorySlugs[category] ?? 'todos'}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openStaticPage = (page: 'sobre' | 'contato') => {
    setSelectedProduct(null)
    setCategoryPage(null)
    setStaticPage(page)
    setIsMenuOpen(false)
    window.history.pushState(null, '', `/${page}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const onHash = () => setRouteHash(window.location.hash || '')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCategoryStartIndex((index) => (index + 1) % categoryCarouselItems.length)
    }, 4200)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBannerIndex((index) => (index + 1) % bannerSlides.length)
    }, 5200)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMobileBannerIndex((index) => (index + 1) % mobileBannerSlides.length)
    }, 5200)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      const [, routeType, routeSlug] = window.location.pathname.split('/')

      if (routeType === 'produto' && routeSlug) {
        const product = productCatalog.find((item) => item.id === routeSlug)
        setSelectedProduct(product ?? null)
        setCategoryPage(null)
        setStaticPage(null)
        setCombosPage(false)
        return
      }

      if (routeType === 'produtos') {
        setSelectedProduct(null)
        setCategoryPage('Todos')
        setStaticPage(null)
        setCombosPage(false)
        return
      }

      if (routeType === 'combos') {
        setSelectedProduct(null)
        setCategoryPage(null)
        setStaticPage(null)
        setCombosPage(true)
        return
      }

      if (routeType === 'categoria' && routeSlug) {
        const category = Object.keys(categorySlugs).find((label) => categorySlugs[label] === routeSlug) ?? 'Todos'
        setActiveCategory(category)
        setCategoryPage(category)
        setSelectedProduct(null)
        setStaticPage(null)
        setCombosPage(false)
        return
      }

      if (routeType === 'sobre' || routeType === 'contato') {
        setStaticPage(routeType)
        setSelectedProduct(null)
        setCategoryPage(null)
        setCombosPage(false)
        return
      }

      setSelectedProduct(null)
      setCategoryPage(null)
      setStaticPage(null)
      setCombosPage(false)
    }

    syncRoute()
    // record visit for analytics on every route sync
    try { recordVisit() } catch (e) {}
    window.addEventListener('popstate', syncRoute)

    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    const closeZoomOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsImageZoomOpen(false)
      }
    }

    window.addEventListener('keydown', closeZoomOnEscape)

    return () => window.removeEventListener('keydown', closeZoomOnEscape)
  }, [])

  // Always render the app shell (header) and include Checkout inside main

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cyan-300 focus:px-5 focus:py-3 focus:font-bold focus:text-blue-950" href="#produtos">
        Pular para produtos
      </a>

      <div className="bg-gradient-to-r from-blue-950 via-sky-800 to-cyan-400 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white sm:text-sm">
        <span className="promo-sweep inline-block">Parcele em ate 12x no cartao</span>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="group flex min-w-0 items-center gap-3" aria-label="Pulsepro inicio" onClick={(event) => {
            event.preventDefault()
            navigateHome()
          }}>
            <img className="h-12 w-auto object-contain sm:h-16" src={logoPulsepro} alt="Pulsepro" />
          </a>

          <label className="ml-auto hidden min-w-72 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-slate-500 shadow-inner lg:flex">
            <Search className="size-5" aria-hidden="true" />
            <span className="sr-only">Pesquisar produtos</span>
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Pesquise produtos..." />
          </label>

          <nav className="hidden items-center gap-7 text-sm font-bold uppercase text-slate-700 lg:flex" aria-label="Navegacao principal">
            {navigationLinks.slice(0, 5).map((link) => (
              <a
                key={link.href}
                className="first:text-sky-700 hover:text-cyan-500"
                href={link.href}
                onClick={(event) => {
                  event.preventDefault()
                    if (link.href === '/sobre' || link.href === '/contato') {
                      openStaticPage(link.href.replace('/', '') as 'sobre' | 'contato')
                      return
                    }

                    if (link.href === '/produtos') {
                      navigateToProductsPage()
                      return
                    }

                    if (link.href === '/combos') {
                      navigateToCombosPage()
                      return
                    }

                    // Default: go to home
                    navigateHome()
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-slate-200 text-blue-950 transition hover:border-cyan-400 hover:bg-cyan-50 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              aria-label="Minha conta"
              onClick={() => setIsAccountOpen(true)}
            >
              <UserRound className="size-5" />
            </button>
            <button
              type="button"
              className="relative grid size-11 place-items-center rounded-full bg-blue-950 text-white transition hover:bg-sky-800 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              aria-label={`Carrinho com ${cartCount} itens`}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="size-5" />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-red-500 text-xs font-bold">{cartCount}</span>
            </button>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-slate-200 text-blue-950 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100 lg:hidden"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        <nav
          id="mobile-menu"
          className={`${isMenuOpen ? 'mobile-menu-enter grid' : 'hidden'} border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden`}
          aria-label="Navegacao mobile"
        >
          <label className="mb-4 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-slate-500 shadow-inner">
            <Search className="size-5" aria-hidden="true" />
            <span className="sr-only">Pesquisar produtos</span>
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Pesquise produtos..." />
          </label>
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              className="mobile-tap-lift rounded-lg px-3 py-3 text-sm font-black uppercase text-slate-800 transition hover:bg-cyan-50 hover:text-sky-700 active:scale-[0.98] active:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              href={link.href}
              onClick={(event) => {
                event.preventDefault()
                if (link.href === '/sobre' || link.href === '/contato') {
                  openStaticPage(link.href.replace('/', '') as 'sobre' | 'contato')
                  return
                }

                if (link.href === '/produtos') {
                  navigateToProductsPage()
                  return
                }

                if (link.href === '/combos') {
                  navigateToCombosPage()
                  return
                }

                navigateHome()
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      {window.location.pathname.startsWith('/admin-3f2b9a') ? (
        <main>
          <Admin />
        </main>
      ) : routeHash === '#/checkout' ? (
        <main>
          <CheckoutPage />
        </main>
      ) : selectedProduct ? (
        <main>
          <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div className="grid gap-5">
                <button type="button" className="mobile-tap-lift inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase text-sky-700 transition hover:bg-cyan-50 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100" onClick={closeProduct}>
                  <ChevronRight className="size-5 rotate-180" aria-hidden="true" />
                  Voltar para loja
                </button>

                <button type="button" className="mobile-tap-lift group relative grid min-h-[360px] cursor-zoom-in place-items-center overflow-hidden rounded-lg bg-white p-4 text-left focus:outline-none focus:ring-4 focus:ring-cyan-100 sm:min-h-[420px]" aria-label={`Ampliar imagem de ${selectedProduct.name}`} onClick={() => setIsImageZoomOpen(true)}>
                  <Search className="absolute right-5 top-5 z-10 size-6 text-slate-950" aria-hidden="true" />
                  <span className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-950/80 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
                    Clique para ampliar
                  </span>
                  <div className="absolute inset-6 rounded-full bg-cyan-100/60 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />
                  <img className="mobile-product-drift relative z-10 max-h-[440px] w-full object-contain drop-shadow-xl transition duration-700 group-hover:scale-150 sm:max-h-[520px]" src={selectedProduct.gallery?.[0] ?? selectedProduct.image} alt={`Embalagem ${selectedProduct.name}`} />
                </button>

                <button type="button" className="mobile-tap-lift group w-28 overflow-hidden rounded-md border border-slate-200 bg-white p-2 shadow-sm transition hover:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-100" aria-label={`Abrir zoom de ${selectedProduct.name}`} onClick={() => setIsImageZoomOpen(true)}>
                  <img className="h-20 w-full object-contain transition duration-500 group-hover:scale-150" src={selectedProduct.image} alt="" aria-hidden="true" />
                </button>
              </div>

              <div className="pt-2">
                <nav className="text-sm font-medium text-slate-500" aria-label="Caminho do produto">
                  Inicio / Produtos / {selectedProduct.category ?? selectedProduct.tag ?? 'Pulsepro'} / {selectedProduct.name}
                </nav>

                <h1 className="mt-8 max-w-2xl text-4xl font-black leading-tight text-slate-800 sm:text-5xl">{selectedProduct.name}</h1>

                <ul className="mt-7 grid gap-2 text-lg leading-7 text-slate-600">
                  {(selectedProduct.benefits ?? []).map((benefit, index) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <span aria-hidden="true">{['🧠', '🎯', '✨', '🌿'][index % 4]}</span>
                      <span>{benefit};</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap items-end gap-3">
                  {selectedProduct.oldPrice && <span className="text-3xl font-black text-slate-500 line-through">{selectedProduct.oldPrice}</span>}
                  <strong className="text-4xl font-black text-green-700">{selectedProduct.price}</strong>
                </div>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="product-quantity">Quantidade</label>
                  <input id="product-quantity" className="h-14 w-16 rounded-2xl border border-slate-300 text-center text-lg text-slate-800 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" type="number" min="1" defaultValue="1" />
                  <button type="button" className="button-shine mobile-cta-bounce mobile-tap-lift inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-800 px-8 text-base font-black uppercase text-white transition hover:bg-blue-950 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-100" onClick={() => addToCart(selectedProduct)}>
                    <ShoppingCart className="size-5" aria-hidden="true" />
                    Adicionar ao carrinho
                  </button>
                </div>

                <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-6 animate-fade-up">
                  <h2 className="text-xl font-black uppercase text-slate-950">Sobre o produto</h2>
                  <p className="mt-3 leading-7 text-slate-700">{selectedProduct.description ?? selectedProduct.details ?? generateSmartDescription(selectedProduct)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black uppercase text-slate-950">Como usar</h2>
                    <p className="mt-3 leading-7 text-slate-700">{selectedProduct.usage}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-blue-950 to-cyan-500 p-6 text-white">
                    <ShieldCheck className="size-9" aria-hidden="true" />
                    <h2 className="mt-4 text-xl font-black uppercase">Compra segura</h2>
                    <p className="mt-2 text-cyan-50">Checkout preparado para integrar pagamento, frete e cadastro do cliente.</p>
                  </div>
              </div>
          </section>

          <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="block h-1 w-20 rounded-full bg-sky-600" />
                  <h2 className="mt-5 text-3xl font-black text-slate-950">Veja tambem</h2>
                </div>
                <button type="button" className="font-black uppercase text-sky-700" onClick={closeProduct}>Todos produtos</button>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {productCatalog
                  .filter((product) => product.id !== selectedProduct.id)
                  .slice(0, 4)
                  .map((product) => (
                    <article key={product.id} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <button type="button" className="w-full text-left" onClick={() => openProduct(product)}>
                        <div className="flex h-44 items-center justify-center overflow-hidden rounded-md bg-cyan-50">
                          <img className="h-36 object-contain transition duration-500 group-hover:scale-[1.35]" src={product.image} alt={`Produto ${product.name}`} />
                        </div>
                        <p className="mt-4 text-sm font-black uppercase text-sky-700">{product.tag}</p>
                        <h3 className="mt-2 min-h-12 text-lg font-black text-slate-950">{product.name}</h3>
                        <p className="mt-2 text-2xl font-black text-slate-950">{product.price}</p>
                      </button>
                    </article>
                  ))}
              </div>
            </div>
          </section>
        </main>
      ) : combosPage ? (
        <main>
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="mx-auto block h-1 w-20 rounded-full bg-sky-600" />
              <h2 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">Aproveite nossos combos e economize</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {combos.map((combo, index) => (
                <article key={combo.name} className="mobile-card-motion mobile-tap-lift reveal-card group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl active:scale-[0.99]" style={{ animationDelay: `${index * 0.1}s` }}>
                  <span className="animate-offer absolute left-6 top-6 rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white">Oferta!</span>
                  <button type="button" className="mobile-tap-lift w-full text-left" onClick={() => openProduct(combo)}>
                      <div className="flex h-56 items-center justify-center overflow-hidden rounded-md">
                        <img className="h-44 object-contain drop-shadow-xl transition duration-500 group-hover:scale-[1.35] group-hover:-rotate-3" src={combo.image} alt={`Combo ${combo.name}`} />
                      </div>
                  <h3 className="mt-5 min-h-14 text-xl font-bold text-slate-900">{combo.name}</h3>
                  <p className="mt-3 text-xl">
                    <span className="mr-2 text-red-500 line-through">{combo.oldPrice}</span>
                    <span className="font-black text-slate-900">{combo.price}</span>
                  </p>
                  </button>
                  <button type="button" className="mobile-tap-lift mt-4 text-sm font-black uppercase text-sky-700 underline-offset-4 hover:underline" onClick={() => openProduct(combo)}>
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    className="button-shine mobile-tap-lift mt-6 overflow-hidden rounded-full bg-slate-200 px-5 py-3 text-sm font-black uppercase text-slate-700 transition hover:bg-cyan-300 hover:text-blue-950 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-100"
                    onClick={() => addToCart(combo)}
                  >
                    Adicionar ao carrinho
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      ) : categoryPage ? (
        <main>
          <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <button type="button" className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase text-sky-700 transition hover:bg-cyan-50 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100" onClick={navigateHome}>
                <ChevronRight className="size-5 rotate-180" aria-hidden="true" />
                Voltar para home
              </button>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="block h-1 w-20 rounded-full bg-sky-600" />
                  <h1 className="mt-6 text-4xl font-black text-slate-950 sm:text-5xl">
                    {activeCategory === 'Todos' ? 'Todos os produtos' : activeCategory}
                  </h1>
                  <p className="mt-3 max-w-2xl text-lg text-slate-600">
                    Escolha uma categoria e veja somente os produtos relacionados a ela.
                  </p>
                </div>
                <label className="grid gap-2 text-sm font-bold text-slate-700 sm:min-w-80">
                  <span className="sr-only">Ordenar produtos</span>
                  <select className="rounded border border-slate-400 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                    <option value="padrao">Ordenacao padrao</option>
                    <option value="menor-preco">Menor preco</option>
                    <option value="maior-preco">Maior preco</option>
                    <option value="ofertas">Ofertas</option>
                  </select>
                </label>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {categoryCarouselItems.map((category) => (
                  <button
                    key={category.label}
                    type="button"
                    className={`${activeCategory === category.label ? 'bg-blue-950 text-white' : 'bg-white text-slate-700'} rounded-full border border-slate-200 px-4 py-2 text-sm font-black uppercase transition hover:border-cyan-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100`}
                    onClick={() => openCategory(category.label)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product, index) => (
                  <article key={product.id} className="mobile-card-motion mobile-tap-lift reveal-card group relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl active:scale-[0.99]" style={{ animationDelay: `${index * 0.08}s` }}>
                    {product.oldPrice && <span className="animate-offer absolute left-5 top-5 z-10 rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white">Oferta!</span>}
                    <button type="button" className="mobile-tap-lift w-full text-left" onClick={() => openProduct(product)}>
                      <div className="flex h-56 items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-white to-cyan-50">
                        <img className="h-44 object-contain transition duration-500 group-hover:scale-[1.35] group-hover:-rotate-2" src={product.image} alt={`Produto ${product.name}`} />
                      </div>
                      <p className="mt-5 text-sm font-bold uppercase text-sky-700">{product.tag}</p>
                      <h2 className="mt-2 min-h-14 text-lg font-bold text-slate-900">{product.name}</h2>
                      <p className="mt-3 text-2xl font-black text-slate-900">
                        {product.oldPrice && <span className="mr-2 text-lg text-red-500 line-through">{product.oldPrice}</span>}
                        {product.price}
                      </p>
                    </button>
                    <button type="button" className="mobile-tap-lift mt-4 text-sm font-black uppercase text-sky-700 underline-offset-4 hover:underline" onClick={() => openProduct(product)}>
                      Ver detalhes
                    </button>
                    <button
                      type="button"
                      className="button-shine mobile-tap-lift mt-5 overflow-hidden rounded-full bg-slate-200 px-5 py-3 text-sm font-black uppercase text-slate-700 transition hover:bg-cyan-300 hover:text-blue-950 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-100"
                      onClick={() => addToCart(product)}
                    >
                      Adicionar ao carrinho
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      ) : routeHash === '#/checkout' ? (
        <main>
          <CheckoutPage />
        </main>
      ) : staticPage === 'sobre' ? (
        <main>
          <section
            className="relative overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8"
            style={{ backgroundImage: `linear-gradient(90deg, rgba(8,8,8,.88), rgba(8,8,8,.72)), url(${octogonoBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
              <div className="relative grid justify-items-center">
                <img className="h-28 w-auto object-contain sm:h-40" src={logoPulsepro} alt="Pulsepro" />
                <div className="relative mt-8 flex items-end justify-center">
                  <img className="h-72 object-contain drop-shadow-2xl" src={belezaKitImg} alt="Kit Pulsepro" />
                </div>
              </div>

              <article className="rounded-2xl bg-black/20 p-6 backdrop-blur-sm sm:p-8">
                <span className="block h-1 w-20 rounded-full bg-cyan-300" />
                <h1 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">Pulsepro – Ciência Natural para Viver Melhor</h1>
                <div className="mt-6 grid gap-4 text-base leading-7 text-slate-100">
                  <p>Somos uma empresa especializada na venda de suplementos para atletas de alta performance e para quem busca mais saúde e qualidade de vida.</p>
                  <p>Nascemos em Brasília, uma cidade que respira movimento, com amplos espaços ao ar livre e forte cultura esportiva — cenário que influenciou diretamente a criação da nossa marca.</p>
                  <p>Nossa história começa com a vivência do fundador no MMA, esporte que exige disciplina, força, resistência e cuidado constante com o corpo.</p>
                  <p>Por isso, selecionamos suplementos de alta qualidade para apoiar profissionais e pessoas que treinam por saúde, bem-estar e superação diária.</p>
                  <p className="font-black text-white">Pulsepro — impulsionando sua vida!</p>
                </div>
              </article>
            </div>
          </section>
        </main>
      ) : staticPage === 'contato' ? (
        <main>
          <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
              <form className="rounded-2xl bg-slate-100 p-6 shadow-sm sm:p-8" onSubmit={(event) => event.preventDefault()}>
                <span className="mx-auto block h-1 w-16 rounded-full bg-sky-600" />
                <h1 className="mt-5 text-center text-3xl font-black text-slate-800">Fale conosco</h1>
                <div className="mt-6 grid gap-4">
                  <input className="rounded border border-slate-400 bg-white px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" type="text" placeholder="Nome" autoComplete="name" />
                  <input className="rounded border border-slate-400 bg-white px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" type="email" placeholder="Email" autoComplete="email" />
                  <textarea className="min-h-28 rounded border border-slate-400 bg-white px-4 py-3 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" placeholder="Sua mensagem" />
                  <button type="submit" className="w-fit rounded-full bg-slate-800 px-7 py-3 font-bold text-white transition hover:bg-blue-950 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100">
                    Enviar
                  </button>
                </div>
              </form>

              <aside>
                <h2 className="text-3xl font-black text-slate-800">Contato</h2>
                <div className="mt-5 grid gap-3 text-slate-700">
                  <a className="flex items-center gap-3 hover:text-sky-700" href="tel:+5561998386625">
                    <Phone className="size-5 text-sky-700" aria-hidden="true" />
                    +55 (61) 99838-6625
                  </a>
                  <a className="flex items-center gap-3 hover:text-sky-700" href="mailto:duartenumeroum@gmail.com">
                    <Mail className="size-5 text-sky-700" aria-hidden="true" />
                    duartenumeroum@gmail.com
                  </a>
                </div>
                <div className="mt-6">
                  <div className="elementor-social-icons-wrapper" role="list">
                    <span className="elementor-grid-item" role="listitem">
                      <a className="elementor-icon elementor-social-icon elementor-social-icon-whatsapp" href="https://api.whatsapp.com/send/?phone=556198386625&text&type=phone_number&app_absent=0" target="_blank" rel="noopener">
                        <span className="elementor-screen-only">Whatsapp</span>
                        <i aria-hidden="true" className="fab fa-whatsapp" />
                      </a>
                    </span>
                    <span className="elementor-grid-item" role="listitem">
                      <a className="elementor-icon elementor-social-icon elementor-social-icon-instagram" href="https://www.instagram.com/pulsepro.online" target="_blank" rel="noopener">
                        <span className="elementor-screen-only">Instagram</span>
                        <i aria-hidden="true" className="fab fa-instagram" />
                      </a>
                    </span>
                    <span className="elementor-grid-item" role="listitem">
                      <a className="elementor-icon elementor-social-icon elementor-social-icon-tiktok" href="https://www.tiktok.com/@pulsepro.online" target="_blank" rel="noopener">
                        <span className="elementor-screen-only">Tiktok</span>
                        <i aria-hidden="true" className="fab fa-tiktok" />
                      </a>
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
      ) : (
      <main>
        <section className="relative bg-slate-950 lg:overflow-hidden" aria-label="Banners Pulsepro">
          {/* Desktop banner (carousel) */}
          <img className="hidden lg:block w-full object-contain lg:aspect-[1440/599]" src={bannerSlides[bannerIndex]} alt="Banner promocional Pulsepro" />
          {/* Mobile banner - use alternative image to improve visibility on small screens */}
          <div
            className="block lg:hidden w-full overflow-hidden"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              const endX = e.changedTouches?.[0]?.clientX ?? null
              if (touchStartX.current !== null && endX !== null) {
                const delta = touchStartX.current - endX
                if (delta > 50) setMobileBannerIndex((i) => (i + 1) % mobileBannerSlides.length)
                if (delta < -50) setMobileBannerIndex((i) => (i - 1 + mobileBannerSlides.length) % mobileBannerSlides.length)
              }
              touchStartX.current = null
            }}
          >
            <img className="w-full object-contain mobile-banner-kenburns" src={mobileBannerSlides[mobileBannerIndex]} alt="Banner promocional Pulsepro mobile" />
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 lg:hidden">
              {mobileBannerSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${mobileBannerIndex === index ? 'w-8 bg-cyan-300' : 'w-2 bg-white/50'} h-2 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-cyan-100`}
                  aria-label={`Mostrar banner ${index + 1}`}
                  onClick={() => setMobileBannerIndex(index)}
                />
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${bannerIndex === index ? 'w-8 bg-cyan-300' : 'w-2 bg-white/50'} h-2 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-cyan-100`}
                aria-label={`Mostrar banner ${index + 1}`}
                onClick={() => setBannerIndex(index)}
              />
            ))}
          </div>
        </section>

        <section className="overflow-hidden border-y border-cyan-100 bg-white py-4" aria-label="Categorias em destaque">
          <div className="ticker-track flex w-max gap-4">
            {[...benefitTicker, ...benefitTicker, ...benefitTicker].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-blue-950">
                <Sparkles className="size-4 text-cyan-500" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8" id="produtos" aria-label="Carrossel de categorias">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="mx-auto block h-1 w-20 rounded-full bg-sky-600" />
              <h2 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">Conheca nossos produtos</h2>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-4 lg:hidden">
              {categoryCarouselItems.map((category, index) => (
                <button
                  type="button"
                  key={category.label}
                  className="mobile-card-motion mobile-tap-lift group grid min-h-48 justify-items-center rounded-[1.6rem] border border-cyan-100 bg-white p-3 text-center shadow-xl shadow-sky-950/5 transition active:scale-[0.98]"
                  style={{ animationDelay: `${index * 0.08}s` }}
                  onClick={() => openCategory(category.label)}
                >
                  <span className="mobile-category-pulse relative grid size-28 place-items-center rounded-full bg-gradient-to-br from-blue-950 to-cyan-400 p-2 shadow-xl shadow-sky-900/15">
                    <img
                      className="h-full w-full rounded-full object-contain drop-shadow-lg transition duration-500 group-active:scale-110"
                      src={category.image}
                      alt={`Categoria ${category.label}`}
                    />
                    <span className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-950/10 to-transparent" />
                  </span>
                  <strong className="mt-3 grid min-h-10 max-w-32 place-items-center text-xs font-black uppercase leading-tight text-slate-900">
                    {category.label}
                  </strong>
                </button>
              ))}
            </div>

            <div className="relative mt-10 hidden lg:block">
              <button
                type="button"
                className="absolute left-0 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-500 shadow-xl transition hover:text-sky-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                aria-label="Categoria anterior"
                onClick={showPreviousCategory}
              >
                <ChevronRight className="size-6 rotate-180" aria-hidden="true" />
              </button>

              <div className="category-carousel-grid mx-auto grid max-w-6xl grid-cols-4 gap-8">
                {orderedCategories.map((category, index) => (
                  <button
                    type="button"
                    key={`${category.label}-${categoryStartIndex}`}
                    className="category-carousel-item mobile-tap-lift group grid justify-items-center text-center"
                    style={{ animationDelay: `${index * 0.08}s` }}
                    onClick={() => openCategory(category.label)}
                  >
                    <span className="mobile-category-pulse relative grid size-36 place-items-center rounded-full bg-gradient-to-br from-blue-950 to-cyan-400 shadow-xl shadow-sky-900/15 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-active:scale-95 sm:size-44 lg:size-52">
                      <img
                        className="h-full w-full rounded-full object-cover object-center transition duration-500 group-hover:scale-105"
                        src={category.image}
                        alt={`Categoria ${category.label}`}
                      />
                      <span className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-950/10 to-transparent" />
                    </span>
                    <strong className="mt-5 max-w-40 text-base font-black uppercase leading-tight text-slate-900 sm:text-lg">
                      {category.label}
                    </strong>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="absolute right-0 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-500 shadow-xl transition hover:text-sky-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                aria-label="Proxima categoria"
                onClick={showNextCategory}
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-8 hidden justify-center gap-2 lg:flex" aria-label="Indicadores do carrossel de categorias">
              {categoryCarouselItems.map((category, index) => (
                <button
                  key={category.label}
                  type="button"
                  className={`${categoryStartIndex === index ? 'w-7 bg-sky-700' : 'w-2 bg-slate-300'} h-2 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-cyan-100`}
                  aria-label={`Mostrar ${category.label}`}
                  onClick={() => setCategoryStartIndex(index)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8" aria-label="Vitrine de produtos">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="block h-1 w-20 rounded-full bg-sky-600" />
                <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">Produtos em destaque</h2>
                <p className="mt-2 max-w-2xl text-slate-600">Fotos reais dos produtos Pulsepro para o cliente reconhecer as embalagens antes de comprar.</p>
              </div>
              <button type="button" className="w-fit rounded-full bg-blue-950 px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-sky-800 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-100" onClick={() => openCategory('Todos')}>
                Ver todos
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {homeShowcaseProducts.map((product, index) => (
                <article key={product.id} className="mobile-card-motion mobile-tap-lift group overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: `${index * 0.06}s` }}>
                  <button type="button" className="w-full text-left" onClick={() => openProduct(product)}>
                    <div className="grid h-36 place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-white to-cyan-50">
                      <img className="h-28 object-contain drop-shadow-lg transition duration-500 group-hover:scale-125" src={product.image} alt={`Produto ${product.name}`} />
                    </div>
                    <h3 className="mt-4 min-h-10 text-sm font-black leading-tight text-slate-900">{product.name}</h3>
                    <p className="mt-2 text-lg font-black text-slate-950">{product.price}</p>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-100 px-4 py-9 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              { icon: Leaf, title: 'Produtos naturais', text: 'Formulas e ingredientes selecionados para sua rotina.' },
              { icon: CreditCard, title: 'Pagamento facilitado', text: 'Parcele em ate 12x no cartao de credito.' },
              { icon: LockKeyhole, title: 'Compra segura', text: 'Ambiente visual claro para vender com mais confianca.' },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="mobile-card-motion reveal-card group flex items-start gap-4 rounded-lg bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]">
                <span className="mobile-icon-pop grid size-12 shrink-0 place-items-center rounded-full bg-cyan-100 text-sky-700 transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-cyan-300">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-black uppercase text-sky-700">{title}</h2>
                  <p className="mt-1 text-slate-600">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mx-auto block h-1 w-20 rounded-full bg-sky-600" />
            <h2 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">Destaques que vendem beneficio antes do preco</h2>
            <p className="mt-4 text-lg text-slate-600">Cards grandes para apresentar os produtos principais com argumentos fortes e chamada direta.</p>
          </div>

          <div className="mt-10 grid gap-7 lg:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <article key={product.name} className="mobile-card-motion mobile-tap-lift shine-card animated-border group overflow-hidden rounded-lg bg-gradient-to-br from-blue-950 via-sky-900 to-sky-700 p-6 text-white shadow-2xl shadow-slate-900/15 transition duration-300 hover:-translate-y-2 active:scale-[0.99]" style={{ animationDelay: `${index * 0.12}s` }}>
                <button type="button" className="mobile-tap-lift w-full text-left" onClick={() => openProduct(product)}>
                <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-md">
                  <div className="absolute h-36 w-36 rounded-full bg-cyan-300/25 blur-2xl transition group-hover:scale-125" />
                  <img className="relative z-10 h-48 object-contain drop-shadow-2xl transition duration-500 group-hover:scale-[1.35]" src={product.image} alt={`Embalagem ${product.name}`} />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">{product.category}</p>
                <h3 className="mt-3 text-3xl font-black uppercase">{product.name}</h3>
                <p className="mt-3 text-cyan-50">{generateSmartShort(product)}</p>
                <ul className="mt-5 grid gap-3">
                  {(product.benefits ?? []).map((benefit) => (
                    <li key={benefit} className="flex gap-3 text-lg font-bold">
                      <BadgeCheck className="mt-1 size-5 shrink-0 text-lime-300" aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                </button>
                <button type="button" className="mobile-tap-lift mt-5 text-sm font-black uppercase text-cyan-200 underline-offset-4 hover:underline" onClick={() => openProduct(product)}>
                  Ver detalhes
                </button>
                <button
                  type="button"
                  className="button-shine mobile-cta-bounce mobile-tap-lift mt-7 inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-cyan-300 px-6 py-4 text-lg font-black uppercase text-blue-950 transition hover:bg-white active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="size-5" aria-hidden="true" />
                  Eu quero
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="combos">
          <div className="text-center">
            <span className="mx-auto block h-1 w-20 rounded-full bg-sky-600" />
            <h2 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">Aproveite nossos combos e economize</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {combos.map((combo, index) => (
              <article key={combo.name} className="mobile-card-motion mobile-tap-lift reveal-card group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl active:scale-[0.99]" style={{ animationDelay: `${index * 0.1}s` }}>
                <span className="animate-offer absolute left-6 top-6 rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white">Oferta!</span>
                <button type="button" className="mobile-tap-lift w-full text-left" onClick={() => openProduct(combo)}>
                    <div className="flex h-56 items-center justify-center overflow-hidden rounded-md">
                      <img className="h-44 object-contain drop-shadow-xl transition duration-500 group-hover:scale-[1.35] group-hover:-rotate-3" src={combo.image} alt={`Combo ${combo.name}`} />
                    </div>
                <h3 className="mt-5 min-h-14 text-xl font-bold text-slate-900">{combo.name}</h3>
                <p className="mt-3 text-xl">
                  <span className="mr-2 text-red-500 line-through">{combo.oldPrice}</span>
                  <span className="font-black text-slate-900">{combo.price}</span>
                </p>
                </button>
                <button type="button" className="mobile-tap-lift mt-4 text-sm font-black uppercase text-sky-700 underline-offset-4 hover:underline" onClick={() => openProduct(combo)}>
                  Ver detalhes
                </button>
                <button
                  type="button"
                  className="button-shine mobile-tap-lift mt-6 overflow-hidden rounded-full bg-slate-200 px-5 py-3 text-sm font-black uppercase text-slate-700 transition hover:bg-cyan-300 hover:text-blue-950 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  onClick={() => addToCart(combo)}
                >
                  Adicionar ao carrinho
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8" id="sobre">
          <div className="shine-card mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-lg bg-gradient-to-br from-blue-950 to-cyan-500 p-8 text-white shadow-2xl shadow-cyan-950/20 md:grid-cols-[0.7fr_1.3fr] md:p-12">
            <div className="flex items-center justify-center">
              <ShieldCheck className="animate-soft-pulse size-36" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase sm:text-4xl">Qualidade e seguranca garantidas</h2>
              <p className="mt-4 text-lg leading-8 text-cyan-50">
                Uma area institucional forte para reforcar certificacoes, procedencia e cuidado na escolha dos ingredientes antes da decisao de compra.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="mx-auto block h-1 w-20 rounded-full bg-sky-600" />
              <h2 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">Uma marca seria e comprometida com resultados</h2>
              <p className="mt-3 text-lg text-slate-600">Prova social pronta para receber depoimentos reais do cliente.</p>
            </div>
            <div className="testimonial-fade mt-10 overflow-hidden" aria-label="Carrossel de depoimentos de clientes">
              <div className="testimonial-track flex w-max gap-5 py-2">
                {loopingTestimonials.map((testimonial, index) => (
                  <article key={`${testimonial.name}-${index}`} className="w-[82vw] max-w-[390px] shrink-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[390px]">
                    <div className="flex gap-1 text-amber-400" aria-label="5 estrelas">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} className="size-5 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="mt-4 min-h-36 text-lg leading-8 text-slate-700">"{testimonial.text}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <img
                        className="size-14 rounded-full border-2 border-cyan-300 object-cover shadow-lg shadow-cyan-900/10"
                        src={testimonial.photo}
                        alt={`Foto de ${testimonial.name}`}
                        loading="lazy"
                      />
                      <div>
                        <p className="font-black text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-500">{testimonial.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      )}

      <footer className="bg-[#101010] px-4 py-12 text-slate-300 sm:px-6 lg:px-8" id="contato">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.1fr_0.7fr_1fr]">
          <div>
            <img className="h-20 w-auto object-contain" src={logoPulsepro} alt="Pulsepro" />
              <div className="mt-6 grid gap-3">
              <a className="flex items-center gap-3 hover:text-cyan-300" href="mailto:duartenumeroum@gmail.com">
                <Mail className="size-5" aria-hidden="true" />
                duartenumeroum@gmail.com
              </a>
              <a className="flex items-center gap-3 hover:text-cyan-300" href="https://api.whatsapp.com/send/?phone=556198386625&text&type=phone_number&app_absent=0">
                <WhatsAppIcon className="size-5" />
                +55 (61) 99838-6625
              </a>
                {/* pagamentos row moved below to central footer area to avoid duplication */}
            </div>
          </div>
          <nav className="grid gap-3 text-sm font-bold uppercase" aria-label="Links do rodape">
            <a className="hover:text-cyan-300" href="#" onClick={(event) => {
              event.preventDefault()
              navigateToHomeSection()
            }}>Inicio</a>
            <a className="hover:text-cyan-300" href="/produtos" onClick={(event) => {
              event.preventDefault()
              navigateToProductsPage()
            }}>Produtos</a>
            <a className="hover:text-cyan-300" href="/combos" onClick={(event) => {
              event.preventDefault()
              navigateToCombosPage()
            }}>Combos</a>
            <a className="hover:text-cyan-300" href="/sobre" onClick={(event) => {
              event.preventDefault()
              openStaticPage('sobre')
            }}>Sobre</a>
          </nav>
          <div className="flex flex-col items-end gap-3">
            <img src={siteblindadoIcon} alt="Site blindado" className="h-20 object-contain" />
            <img src={pagamentosIcon} alt="Formas de pagamento" className="h-14 object-contain" />
          </div>
        </div>
      </footer>

      <a className="animate-whatsapp fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-900/25 transition hover:-translate-y-1 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200" href="https://api.whatsapp.com/send/?phone=556198386625&text&type=phone_number&app_absent=0" aria-label="Chamar no WhatsApp">
        <WhatsAppIcon className="size-8" />
      </a>

      {selectedProduct && (
        <div className={`${isImageZoomOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-[80] grid place-items-center bg-slate-950/85 px-4 py-6 backdrop-blur-md transition-opacity`} aria-hidden={!isImageZoomOpen}>
          <button type="button" className="absolute inset-0 h-full w-full cursor-zoom-out" aria-label="Fechar imagem ampliada" onClick={() => setIsImageZoomOpen(false)} />
          <section className={`${isImageZoomOpen ? 'scale-100 mobile-zoom-pop' : 'scale-95'} relative grid max-h-[calc(100svh-2rem)] w-full max-w-6xl place-items-center rounded-lg bg-white p-4 shadow-2xl transition duration-300 sm:p-8`} aria-label={`Imagem ampliada de ${selectedProduct.name}`}>
            <button type="button" className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-cyan-100" aria-label="Fechar zoom" onClick={() => setIsImageZoomOpen(false)}>
              <X className="size-5" aria-hidden="true" />
            </button>
            <img className="max-h-[82svh] w-full object-contain drop-shadow-2xl" src={selectedProduct.image} alt={`Imagem ampliada do produto ${selectedProduct.name}`} />
            <p className="mt-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Pressione Esc ou clique fora para fechar</p>
          </section>
        </div>
      )}

      <div className={`${isCartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-sm transition-opacity`} aria-hidden={!isCartOpen}>
        <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Fechar carrinho" onClick={() => setIsCartOpen(false)} />
        <aside
          className={`${isCartOpen ? 'translate-x-0' : 'translate-x-full'} absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300`}
          aria-label="Carrinho de compras"
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-sky-700">Seu carrinho</p>
              <h2 className="text-2xl font-black text-slate-950">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</h2>
            </div>
            <button type="button" className="grid size-11 place-items-center rounded-full border border-slate-200 text-blue-950 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-cyan-100" aria-label="Fechar carrinho" onClick={() => setIsCartOpen(false)}>
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {cartItems.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <span className="mx-auto grid size-20 place-items-center rounded-full bg-cyan-50 text-sky-700">
                    <ShoppingCart className="size-9" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-2xl font-black text-slate-950">Carrinho vazio</h3>
                  <p className="mt-2 text-slate-600">Adicione produtos para montar o pedido do cliente.</p>
                  <button type="button" className="mt-6 rounded-full bg-cyan-300 px-6 py-3 font-black uppercase text-blue-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-4 focus:ring-cyan-100" onClick={() => setIsCartOpen(false)}>
                    Ver produtos
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {cartItems.map((item) => (
                  <article key={item.name} className="grid grid-cols-[84px_1fr] gap-4 rounded-lg border border-slate-200 p-3">
                    <div className="grid h-24 place-items-center rounded-md bg-cyan-50">
                      <img className="h-20 object-contain" src={item.image} alt={`Produto ${item.name}`} />
                    </div>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-950">{item.name}</h3>
                          <p className="text-sm font-bold uppercase text-sky-700">{item.tag ?? item.category ?? 'Pulsepro'}</p>
                        </div>
                        <p className="font-black text-slate-950">{item.price}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-full border border-slate-200">
                          <button type="button" className="grid size-9 place-items-center text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-100" aria-label={`Diminuir quantidade de ${item.name}`} onClick={() => updateCartQuantity(item.name, -1)}>
                            <Minus className="size-4" />
                          </button>
                          <span className="grid size-9 place-items-center text-sm font-black">{item.quantity}</span>
                          <button type="button" className="grid size-9 place-items-center text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-100" aria-label={`Aumentar quantidade de ${item.name}`} onClick={() => updateCartQuantity(item.name, 1)}>
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <button type="button" className="text-sm font-bold text-red-600 hover:text-red-700" onClick={() => updateCartQuantity(item.name, -item.quantity)}>
                          Remover
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-5">
            <div className="mb-4 rounded-lg bg-slate-50 p-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <strong className="text-slate-950">{formatCurrency(cartSubtotal)}</strong>
              </div>
              <div className="mt-2 flex justify-between text-sm text-slate-500">
                <span>Frete</span>
                <span>Calculado no checkout</span>
              </div>
            </div>
            <button type="button" className="button-shine inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-blue-950 px-6 py-4 font-black uppercase text-white transition hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-cyan-100" disabled={cartItems.length === 0} onClick={() => { try { sessionStorage.setItem('cart', JSON.stringify(cartItems)) } catch (e) {} window.location.hash = '#/checkout' }}>
              Finalizar compra
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <button type="button" className="mt-3 w-full rounded-full px-6 py-3 font-black uppercase text-sky-700 transition hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-100" onClick={() => setIsCartOpen(false)}>
              Continuar comprando
            </button>
          </div>
        </aside>
      </div>

      <div className={`${isAccountOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm transition-opacity`} aria-hidden={!isAccountOpen}>
        <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Fechar area da conta" onClick={() => setIsAccountOpen(false)} />
        <section className={`${isAccountOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'} relative max-h-[calc(100svh-2rem)] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl transition duration-300`} aria-label="Area da conta">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="hidden bg-gradient-to-br from-blue-950 via-sky-800 to-cyan-400 p-8 text-white lg:grid lg:content-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                  <Lock className="size-4" aria-hidden="true" />
                  Acesso seguro
                </p>
                <h2 className="mt-8 text-4xl font-black uppercase leading-tight">Entre para acompanhar seus pedidos</h2>
                <p className="mt-4 text-lg leading-8 text-cyan-50">Login e cadastro preparados para conectar com checkout, historico de pedidos e recuperacao de senha.</p>
              </div>
              <div className="grid gap-3 text-sm font-bold uppercase tracking-[0.12em] text-cyan-50">
                <span>Compra rapida</span>
                <span>Pedidos salvos</span>
                <span>Atendimento pelo WhatsApp</span>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-sky-700">Minha conta</p>
                  <h2 className="mt-1 text-3xl font-black text-slate-950">{accountMode === 'login' ? 'Entrar' : 'Criar cadastro'}</h2>
                </div>
                <button type="button" className="grid size-11 place-items-center rounded-full border border-slate-200 text-blue-950 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-cyan-100" aria-label="Fechar area da conta" onClick={() => setIsAccountOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1">
                <button type="button" className={`${accountMode === 'login' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600'} rounded-full px-4 py-3 text-sm font-black uppercase transition focus:outline-none focus:ring-4 focus:ring-cyan-100`} onClick={() => setAccountMode('login')}>
                  Login
                </button>
                <button type="button" className={`${accountMode === 'register' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600'} rounded-full px-4 py-3 text-sm font-black uppercase transition focus:outline-none focus:ring-4 focus:ring-cyan-100`} onClick={() => setAccountMode('register')}>
                  Cadastro
                </button>
              </div>

              <form className="mt-7 grid gap-4" onSubmit={(event) => event.preventDefault()}>
                {accountMode === 'register' && (
                  <div className="grid gap-2">
                    <label className="text-sm font-black uppercase text-slate-700" htmlFor="name">Nome completo</label>
                    <input id="name" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" type="text" placeholder="Seu nome" autoComplete="name" />
                  </div>
                )}

                <div className="grid gap-2">
                  <label className="text-sm font-black uppercase text-slate-700" htmlFor="email">E-mail</label>
                  <input id="email" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" type="email" placeholder="voce@email.com" autoComplete="email" />
                </div>

                {accountMode === 'register' && (
                  <div className="grid gap-2">
                    <label className="text-sm font-black uppercase text-slate-700" htmlFor="phone">Telefone</label>
                    <input id="phone" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" type="tel" placeholder="(00) 00000-0000" autoComplete="tel" />
                  </div>
                )}

                <div className="grid gap-2">
                  <label className="text-sm font-black uppercase text-slate-700" htmlFor="password">Senha</label>
                  <input id="password" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" type="password" placeholder="Digite sua senha" autoComplete={accountMode === 'login' ? 'current-password' : 'new-password'} />
                </div>

                {accountMode === 'register' && (
                  <label className="flex items-start gap-3 rounded-lg bg-cyan-50 p-4 text-sm text-slate-700">
                    <input className="mt-1 size-4 accent-sky-700" type="checkbox" />
                    Quero receber ofertas, novidades e cupons da Pulsepro por e-mail ou WhatsApp.
                  </label>
                )}

                <button type="submit" className="button-shine mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-blue-950 px-6 py-4 font-black uppercase text-white transition hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-cyan-100">
                  {accountMode === 'login' ? 'Entrar na conta' : 'Criar minha conta'}
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </form>

              <div className="mt-5 flex flex-col gap-3 text-center text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" className="font-bold text-sky-700 hover:text-cyan-500">
                  Esqueci minha senha
                </button>
                <button type="button" className="font-bold text-sky-700 hover:text-cyan-500" onClick={() => setAccountMode(accountMode === 'login' ? 'register' : 'login')}>
                  {accountMode === 'login' ? 'Ainda nao tenho cadastro' : 'Ja tenho cadastro'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Checkout modal (mocked) */}
      <div className={`${isCheckoutOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-[85] grid place-items-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm transition-opacity`} aria-hidden={!isCheckoutOpen}>
        <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Fechar checkout" onClick={() => setIsCheckoutOpen(false)} />
        <section role="dialog" aria-modal="true" className={`${isCheckoutOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'} relative max-h-[calc(100svh-2rem)] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl transition duration-300`} aria-label="Checkout">
          <div className="md:grid md:grid-cols-[1fr_380px] gap-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-blue-950">Finalizar compra</h2>
                <button type="button" className="grid size-11 place-items-center rounded-full border border-slate-200 text-blue-950" onClick={() => setIsCheckoutOpen(false)} aria-label="Fechar checkout"><X className="size-5" /></button>
              </div>

              <form className="mt-6 grid gap-6" onSubmit={(e) => { e.preventDefault() }}>
                <fieldset>
                  <legend className="font-black text-slate-900">Endereço de entrega</legend>
                  <div className="mt-3 grid gap-3">
                    <label className="text-sm font-medium text-slate-700">Nome</label>
                    <input aria-label="Nome do destinatário" autoFocus={isCheckoutOpen} className="w-full rounded-md border border-slate-200 px-3 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-cyan-100" placeholder="Nome completo" value={shippingAddress.name} onChange={(e) => setShippingAddress((s) => ({ ...s, name: e.target.value }))} />
                    <label className="text-sm font-medium text-slate-700">Rua e número</label>
                    <input aria-label="Rua e número" className="w-full rounded-md border border-slate-200 px-3 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-cyan-100" placeholder="Rua, número, complemento" value={shippingAddress.street} onChange={(e) => setShippingAddress((s) => ({ ...s, street: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <input aria-label="Cidade" className="rounded-md border border-slate-200 px-3 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-cyan-100" placeholder="Cidade" value={shippingAddress.city} onChange={(e) => setShippingAddress((s) => ({ ...s, city: e.target.value }))} />
                      <div className="flex gap-3">
                        <input aria-label="Estado" className="rounded-md border border-slate-200 px-3 py-3 w-28 text-sm bg-white shadow-sm focus:ring-2 focus:ring-cyan-100" placeholder="UF" value={shippingAddress.state} onChange={(e) => setShippingAddress((s) => ({ ...s, state: e.target.value }))} />
                        <input aria-label="CEP" className="rounded-md border border-slate-200 px-3 py-3 w-36 text-sm bg-white shadow-sm focus:ring-2 focus:ring-cyan-100" placeholder="CEP" value={shippingAddress.zip} onChange={(e) => setShippingAddress((s) => ({ ...s, zip: e.target.value }))} />
                      </div>
                    </div>
                    <label className="text-sm font-medium text-slate-700">Telefone</label>
                    <input aria-label="Telefone" className="w-full rounded-md border border-slate-200 px-3 py-3 text-sm bg-white shadow-sm focus:ring-2 focus:ring-cyan-100" placeholder="Telefone" value={shippingAddress.phone} onChange={(e) => setShippingAddress((s) => ({ ...s, phone: e.target.value }))} />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="font-black text-slate-900">Frete</legend>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <label className={`flex items-center gap-2 rounded-md border px-4 py-3 ${shippingMethod === 'standard' ? 'bg-sky-50 border-sky-200' : ''}`}>
                      <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} aria-checked={shippingMethod === 'standard'} />
                      <div>
                        <div className="font-bold">Standard</div>
                        <div className="text-sm text-slate-600">Entrega em 5-8 dias — R$15,00</div>
                      </div>
                    </label>
                    <label className={`flex items-center gap-2 rounded-md border px-4 py-3 ${shippingMethod === 'express' ? 'bg-sky-50 border-sky-200' : ''}`}>
                      <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} aria-checked={shippingMethod === 'express'} />
                      <div>
                        <div className="font-bold">Express</div>
                        <div className="text-sm text-slate-600">Entrega em 1-2 dias — R$25,00</div>
                      </div>
                    </label>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="font-black text-slate-900">Pagamento</legend>
                  <div className="mt-3 grid gap-3">
                    <div className="flex gap-2">
                      <button type="button" className={`flex-1 rounded-md border px-4 py-2 ${paymentMethod === 'card' ? 'bg-sky-700 text-white' : 'bg-white'}`} onClick={() => setPaymentMethod('card')} aria-pressed={paymentMethod === 'card'}>Cartão</button>
                      <button type="button" className={`flex-1 rounded-md border px-4 py-2 ${paymentMethod === 'boleto' ? 'bg-sky-700 text-white' : 'bg-white'}`} onClick={() => setPaymentMethod('boleto')} aria-pressed={paymentMethod === 'boleto'}>Boleto</button>
                      <button type="button" className={`flex-1 rounded-md border px-4 py-2 ${paymentMethod === 'pix' ? 'bg-sky-700 text-white' : 'bg-white'}`} onClick={() => setPaymentMethod('pix')} aria-pressed={paymentMethod === 'pix'}>Pix</button>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="grid gap-2">
                        <label className="sr-only">Número do cartão</label>
                        <input aria-label="Número do cartão" className="rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-200" placeholder="Número do cartão (mock)" />
                        <div className="flex gap-2">
                          <input aria-label="Validade" className="rounded-md border px-3 py-2 flex-1 focus:ring-2 focus:ring-cyan-200" placeholder="MM/AA" />
                          <input aria-label="CVV" className="rounded-md border px-3 py-2 w-28 focus:ring-2 focus:ring-cyan-200" placeholder="CVV" />
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>

                <div className="mt-4 grid gap-3">
                  <button type="button" className="w-full md:w-auto rounded-full bg-blue-950 px-6 py-3 text-base font-black text-white hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-cyan-200 shadow" onClick={() => {
                    const shippingCost = shippingMethod === 'standard' ? 15 : 25
                    const total = cartSubtotal + shippingCost
                    const orderId = `PP-${Math.floor(Math.random() * 900000 + 100000)}`
                    setOrderPlaced({ id: orderId, total })
                    setCartItems([])
                  }}>
                    Pagar agora (mock)
                  </button>
                  <button type="button" className="w-full md:w-auto rounded-full border px-4 py-3 font-black" onClick={() => setIsCheckoutOpen(false)}>Voltar</button>
                </div>
              </form>
            </div>

            <aside className="bg-slate-50 p-6">
              <h3 className="font-black text-slate-900">Resumo do pedido</h3>
              <div className="mt-4 space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-slate-600">Seu carrinho está vazio.</p>
                ) : (
                  cartItems.map((it) => (
                    <div key={it.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt="" className="h-12 w-12 object-contain rounded-md bg-white/50 p-1" />
                        <div>
                          <div className="text-sm font-bold">{it.name}</div>
                          <div className="text-xs text-slate-600">x{it.quantity}</div>
                        </div>
                      </div>
                      <div className="font-black">{formatCurrency(parsePrice(it.price) * it.quantity)}</div>
                    </div>
                  ))
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(cartSubtotal)}</strong>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 mt-1">
                    <span>Frete</span>
                    <strong>{shippingMethod === 'standard' ? 'R$15,00' : 'R$25,00'}</strong>
                  </div>
                  <div className="flex justify-between text-lg font-black mt-3">
                    <span>Total</span>
                    <strong>{formatCurrency(cartSubtotal + (shippingMethod === 'standard' ? 15 : 25))}</strong>
                  </div>
                </div>
              </div>

              {orderPlaced && (
                <div className="mt-6 rounded-lg border p-4 bg-green-50">
                  <h4 className="font-black">Pedido confirmado</h4>
                  <p className="mt-2">Número do pedido: <strong>{orderPlaced.id}</strong></p>
                  <p className="mt-2">Total: <strong>{formatCurrency(orderPlaced.total)}</strong></p>
                  <p className="mt-2 text-sm text-slate-600">Este é um pedido de teste (mock). Não há transação real.</p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
