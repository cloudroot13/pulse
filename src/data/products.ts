import cabeloPeleUnhaImg from '../assets/produtos/beleza/Cabelo-Pele-e-Unha.webp'
import cabeloPeleUnhaKit2Img from '../assets/produtos/beleza/Cabelo-Pele-e-Unha-2.webp'
import cabeloPeleUnhaKit3Img from '../assets/produtos/beleza/Cabelo-Pele-e-Unha-3.webp'
import belezaCategoriaImg from '../assets/produtos/beleza/Pulsepro_Prancheta-2.webp'
import brainFuelKit2Img from '../assets/produtos/performance_energia/brain-fuel/Brain-Fuel-2.webp'
import brainFuelKit3Img from '../assets/produtos/performance_energia/brain-fuel/Brain-Fuel-3.webp'
import brainFuelImg from '../assets/produtos/performance_energia/brain-fuel/Brain-Fuel-300x300.webp'
import creatinaGummyKit2Img from '../assets/produtos/performance_energia/creatina-gummy/Creatina-Gummy-2.webp'
import creatinaGummyKit3Img from '../assets/produtos/performance_energia/creatina-gummy/Creatina-Gummy-3.webp'
import creatinaGummyImg from '../assets/produtos/performance_energia/creatina-gummy/Creatina-Gummy.webp'
import creatinaPuraKit2Img from '../assets/produtos/performance_energia/creatina-pure/Creatina-2.webp'
import creatinaPuraImg from '../assets/produtos/performance_energia/creatina-pure/Creatina.webp'
import pulsePowerImg from '../assets/produtos/performance_energia/pulse-power/Pulse-Power.webp'
import melatoninaKit2Img from '../assets/produtos/rotina_bem-estar/melatonina/Melatonina-2.webp'
import melatoninaKit3Img from '../assets/produtos/rotina_bem-estar/melatonina/Melatonina-3.webp'
import melatoninaImg from '../assets/produtos/rotina_bem-estar/melatonina/Melatonina.webp'
import pulseFlexKit3Img from '../assets/produtos/rotina_bem-estar/pulse-flex/Pulse-Flex-3.webp'
import pulseFlexImg from '../assets/produtos/rotina_bem-estar/pulse-flex/Pulse-Flex.webp'
import pulseFlexKit2Img from '../assets/produtos/rotina_bem-estar/pulse-flex/Pulse-Flex-2.webp'

export type Product = {
  id: string
  name: string
  price: string
  tag?: string
  category?: string
  description?: string
  benefits?: string[]
  oldPrice?: string
  subtitle?: string
  details?: string
  ingredients?: string[]
  usage?: string
  gallery?: string[]
  image: string
}

export const productCatalog: Product[] = [
  {
    id: 'creatina-gummy',
    category: 'Performance e energia',
    name: 'Creatina Gummy',
    price: 'R$149,90',
    tag: 'Performance',
    subtitle: 'Creatina em gomas mastigaveis para uma rotina mais pratica.',
    description: 'Mais praticidade para completar seus treinos com energia.',
    details: 'Ideal para quem busca praticidade no consumo diario de creatina, com formato facil de carregar e encaixar na rotina.',
    benefits: ['Mais força e desempenho físico', 'Prático e saboroso para rotina', 'Mais energia para a última série'],
    ingredients: ['Creatina monohidratada', 'Sabor uva verde', 'Gomas mastigaveis'],
    usage: 'Consuma conforme orientacao do rotulo ou indicacao profissional.',
    image: creatinaGummyImg,
  },
  {
    id: 'pulse-flex',
    category: 'Dores articulares',
    name: 'Pulse Flex',
    price: 'R$89,90',
    tag: 'Bem-estar',
    subtitle: 'Suporte para mobilidade e conforto no dia a dia.',
    description: 'Suporte diário para mobilidade, conforto e bem-estar.',
    details: 'Pensado para pessoas que querem cuidar das articulacoes e manter uma rotina mais leve para se movimentar.',
    benefits: ['Mais mobilidade no dia a dia', 'Ajuda no cuidado das articulações', 'Rotina mais leve para se movimentar'],
    ingredients: ['Colageno tipo 2', 'Curcuma', 'Capsulas praticas'],
    usage: 'Use diariamente conforme recomendacao do fabricante.',
    image: pulseFlexImg,
  },
  {
    id: 'pulse-power',
    category: 'Performance e energia',
    name: 'Pulse Power',
    price: 'R$119,90',
    tag: 'Performance',
    subtitle: 'Pre-treino para foco, disposicao e intensidade.',
    description: 'Foco e intensidade para treinos mais produtivos.',
    details: 'Formula criada para quem precisa de mais energia e foco antes dos treinos, com comunicacao clara para venda online.',
    benefits: ['Auxilia na performance física', 'Suporte para treinos intensos', 'Sabor marcante e refrescante'],
    ingredients: ['Beta-alanina', 'Taurina', 'Creatina'],
    usage: 'Consumir antes do treino conforme orientacao do rotulo.',
    image: pulsePowerImg,
  },
  {
    id: 'cabelo-pele-unha',
    name: 'Cabelo, Pele e Unha',
    price: 'R$89,90',
    tag: 'Beleza',
    category: 'Beleza',
    subtitle: 'Cuidado diario para beleza de dentro para fora.',
    description: 'Formula para fortalecer a rotina de cuidado com cabelo, pele e unhas.',
    details: 'Produto indicado para destacar a linha de beleza da marca com foco em autocuidado e consistencia no uso.',
    benefits: ['Ajuda na rotina de beleza', 'Suporte para cabelo, pele e unhas', 'Capsulas faceis de consumir'],
    ingredients: ['Biotina', 'Selenio', 'Vitaminas selecionadas'],
    usage: 'Consumir conforme recomendacao do rotulo.',
    image: cabeloPeleUnhaImg,
  },
  {
    id: 'cabelo-pele-unha-kit-2',
    name: 'Cabelo, Pele e Unha (Kit com 2)',
    price: 'R$149,90',
    oldPrice: 'R$179,80',
    tag: 'Beleza',
    category: 'Beleza',
    subtitle: 'Kit com 2 unidades para manter o autocuidado em dia.',
    description: 'Combo de beleza com melhor custo-beneficio.',
    details: 'Ideal para quem quer manter uma rotina constante de cuidados com cabelo, pele e unhas.',
    benefits: ['Economia no kit', 'Rotina de beleza prolongada', 'Boa opcao para recompra'],
    ingredients: ['Biotina', 'Selenio', 'Vitaminas selecionadas'],
    usage: 'Consumir conforme recomendacao do rotulo.',
    image: cabeloPeleUnhaKit2Img,
  },
  {
    id: 'cabelo-pele-unha-kit-3',
    name: 'Cabelo, Pele e Unha (Kit com 3)',
    price: 'R$199,90',
    oldPrice: 'R$269,70',
    tag: 'Beleza',
    category: 'Beleza',
    subtitle: 'Kit com 3 unidades para uma rotina completa.',
    description: 'Combo especial de beleza com mais economia.',
    details: 'Pensado para aumentar o ticket medio e destacar a economia da compra em kit.',
    benefits: ['Maior economia', 'Mais unidades para uso continuo', 'Cuidado de dentro para fora'],
    ingredients: ['Biotina', 'Selenio', 'Vitaminas selecionadas'],
    usage: 'Consumir conforme recomendacao do rotulo.',
    image: cabeloPeleUnhaKit3Img,
  },
  {
    id: 'melatonina',
    name: 'Melatonina',
    price: 'R$59,90',
    tag: 'Sono',
    category: 'Rotina e bem-estar',
    subtitle: 'Apoio para noites mais tranquilas.',
    description: 'Melatonina mastigavel para apoiar a rotina de descanso.',
    details: 'Uma tela pensada para vender bem-estar, com foco em rotina noturna, praticidade e informacoes simples.',
    benefits: ['Auxilia a rotina do sono', 'Formato mastigavel', 'Pratico para usar antes de dormir'],
    ingredients: ['Melatonina', 'Sabor maracuja', 'Comprimidos mastigaveis'],
    usage: 'Consumir antes de dormir conforme orientacao do rotulo.',
    image: melatoninaImg,
  },
  {
    id: 'melatonina-kit-2',
    name: 'Melatonina (Kit com 2)',
    price: 'R$99,90',
    oldPrice: 'R$119,80',
    tag: 'Sono',
    category: 'Rotina e bem-estar',
    subtitle: 'Kit com 2 unidades para manter sua rotina de descanso.',
    description: 'Combo de melatonina mastigavel com melhor custo-beneficio.',
    details: 'Opcao em kit para quem deseja manter consistencia na rotina noturna e economizar comprando mais unidades.',
    benefits: ['Economia no kit', 'Rotina de sono prolongada', 'Formato mastigavel e pratico'],
    ingredients: ['Melatonina', 'Sabor maracuja', 'Comprimidos mastigaveis'],
    usage: 'Consumir antes de dormir conforme orientacao do rotulo.',
    image: melatoninaKit2Img,
  },
  {
    id: 'melatonina-kit-3',
    name: 'Melatonina (Kit com 3)',
    price: 'R$139,90',
    oldPrice: 'R$179,70',
    tag: 'Sono',
    category: 'Rotina e bem-estar',
    subtitle: 'Kit com 3 unidades para cuidado continuo do sono.',
    description: 'Combo especial de melatonina para mais economia.',
    details: 'Pensado para aumentar recorrencia e facilitar a compra de quem usa melatonina na rotina de descanso.',
    benefits: ['Maior economia', 'Mais unidades para uso continuo', 'Apoio para noites mais tranquilas'],
    ingredients: ['Melatonina', 'Sabor maracuja', 'Comprimidos mastigaveis'],
    usage: 'Consumir antes de dormir conforme orientacao do rotulo.',
    image: melatoninaKit3Img,
  },
  {
    id: 'brain-fuel',
    name: 'Brain Fuel – Foco e Concentração',
    price: 'R$89,90',
    tag: 'Foco',
    category: 'Performance e energia',
    subtitle: 'Suporte para foco, memoria e concentracao na rotina.',
    description: 'Formula para apoiar clareza mental, foco e produtividade.',
    details: 'Produto da linha performance indicado para quem quer reforcar foco em estudos, trabalho e rotina intensa.',
    benefits: ['Melhora o foco e a concentracao', 'Estimula memoria e aprendizado', 'Favorece clareza mental'],
    ingredients: ['Coenzima Q10', 'Tirosina', 'Colina'],
    usage: 'Consumir conforme recomendacao do rotulo.',
    image: brainFuelImg,
  },
  {
    id: 'brain-fuel-kit-2',
    name: 'Brain Fuel – Foco e Concentração (Kit com 2)',
    price: 'R$149,90',
    oldPrice: 'R$179,80',
    tag: 'Foco',
    category: 'Performance e energia',
    subtitle: 'Kit com 2 unidades para foco e produtividade.',
    description: 'Kit para apoiar foco, concentracao e rotina produtiva.',
    details: 'Boa tela para apresentar combos e economia, reforcando o custo-beneficio da compra em kit.',
    benefits: ['Ajuda na rotina de foco', 'Kit com melhor custo-beneficio', 'Ideal para estudo e trabalho'],
    ingredients: ['Coenzima Q10', 'Tirosina', 'Colina'],
    usage: 'Consumir conforme recomendacao do rotulo.',
    image: brainFuelKit2Img,
  },
  {
    id: 'brain-fuel-kit-3',
    name: 'Brain Fuel – Foco e Concentração (Kit com 3)',
    price: 'R$199,90',
    oldPrice: 'R$269,70',
    tag: 'Foco',
    category: 'Performance e energia',
    subtitle: 'Kit com 3 unidades para foco continuo.',
    description: 'Combo Brain Fuel com maior economia para a rotina.',
    details: 'Pensado para quem busca uso continuo, recompra planejada e melhor custo-beneficio.',
    benefits: ['Maior economia no combo', 'Mais unidades para uso continuo', 'Apoio para foco diario'],
    ingredients: ['Coenzima Q10', 'Tirosina', 'Colina'],
    usage: 'Consumir conforme recomendacao do rotulo.',
    image: brainFuelKit3Img,
  },
  {
    id: 'creatina-gummy-kit-2',
    name: 'Creatina Gummy (Kit com 2)',
    price: 'R$259,90',
    oldPrice: 'R$299,80',
    tag: 'Performance',
    category: 'Performance e energia',
    subtitle: 'Kit com 2 unidades de Creatina Gummy.',
    description: 'Combo pratico para manter a rotina de creatina.',
    details: 'Opcao para quem quer praticidade, recompra e melhor custo-beneficio em gomas mastigaveis.',
    benefits: ['Economia no kit', 'Mais praticidade por mais tempo', 'Boa opcao para uso recorrente'],
    ingredients: ['Creatina monohidratada', 'Gomas mastigaveis', 'Sabor uva verde'],
    usage: 'Consuma conforme orientacao do rotulo.',
    image: creatinaGummyKit2Img,
  },
  {
    id: 'creatina-gummy-kit',
    name: 'Creatina Gummy (Kit com 3)',
    price: 'R$349,90',
    oldPrice: 'R$449,70',
    tag: 'Combo',
    category: 'Performance e energia',
    subtitle: 'Kit economico com 3 unidades de Creatina Gummy.',
    description: 'Mais unidades para manter consistencia por mais tempo.',
    details: 'Tela de combo ideal para aumentar ticket medio, destacando economia e recorrencia de uso.',
    benefits: ['Economia no kit', 'Mais praticidade por mais tempo', 'Boa opcao para uso recorrente'],
    ingredients: ['Creatina monohidratada', 'Gomas mastigaveis', 'Sabor uva verde'],
    usage: 'Consuma conforme orientacao do rotulo.',
    image: creatinaGummyKit3Img,
  },
  {
    id: 'creatina-pura',
    name: 'Creatina Pura Monohidratada',
    price: 'R$124,90',
    tag: 'Performance',
    category: 'Performance e energia',
    subtitle: 'Creatina monohidratada em po para performance diaria.',
    description: 'Creatina pura para auxiliar forca, energia e desempenho fisico.',
    details: 'Produto essencial para a linha performance, ideal para quem prefere creatina em po e busca um consumo simples no dia a dia.',
    benefits: ['100% creatina monohidratada', 'Auxilia no desempenho fisico', 'Boa opcao para rotina de treino'],
    ingredients: ['Creatina monohidratada', 'Formato em po', 'Uso diario'],
    usage: 'Misture em agua ou bebida de preferencia conforme recomendacao do rotulo.',
    image: creatinaPuraImg,
  },
  {
    id: 'creatina-pura-kit-2',
    name: 'Creatina Pura Monohidratada (Kit com 2)',
    price: 'R$214,90',
    oldPrice: 'R$249,80',
    tag: 'Performance',
    category: 'Performance e energia',
    subtitle: 'Kit com 2 unidades de creatina pura.',
    description: 'Combo de creatina pura com economia para uso continuo.',
    details: 'Opcao para quem quer manter consistencia no consumo de creatina em po e economizar no kit.',
    benefits: ['Economia no kit', '100% creatina monohidratada', 'Mais unidades para rotina de treino'],
    ingredients: ['Creatina monohidratada', 'Formato em po', 'Uso diario'],
    usage: 'Misture em agua ou bebida de preferencia conforme recomendacao do rotulo.',
    image: creatinaPuraKit2Img,
  },
  {
    id: 'pulse-flex-kit',
    name: 'Pulse Flex – Dores Articulares (Kit com 2)',
    price: 'R$149,90',
    oldPrice: 'R$179,80',
    tag: 'Combo',
    category: 'Rotina e bem-estar',
    subtitle: 'Kit com 2 unidades para cuidado continuo.',
    description: 'Combo para manter a rotina de mobilidade e bem-estar.',
    details: 'Produto para reforcar compra em kit com foco em cuidado prolongado e economia.',
    benefits: ['Economia no combo', 'Suporte continuo para articulacoes', 'Mais praticidade para recompra'],
    ingredients: ['Colageno tipo 2', 'Curcuma', 'Capsulas'],
    usage: 'Use diariamente conforme recomendacao do fabricante.',
    image: pulseFlexKit2Img,
  },
  {
    id: 'pulse-flex-kit-3',
    name: 'Pulse Flex – Dores Articulares (Kit com 3)',
    price: 'R$199,90',
    oldPrice: 'R$269,70',
    tag: 'Combo',
    category: 'Rotina e bem-estar',
    subtitle: 'Kit com 3 unidades para cuidado prolongado das articulacoes.',
    description: 'Combo Pulse Flex com maior economia para a rotina.',
    details: 'Oferta ideal para quem busca cuidado continuo, recompra planejada e melhor custo-beneficio.',
    benefits: ['Maior economia no combo', 'Cuidado continuo para articulacoes', 'Mais praticidade para recompra'],
    ingredients: ['Colageno tipo 2', 'Curcuma', 'Capsulas'],
    usage: 'Use diariamente conforme recomendacao do fabricante.',
    image: pulseFlexKit3Img,
  },
]

export const categoryCarouselItems = [
  { label: 'Todos', image: creatinaGummyKit3Img },
  { label: 'Performance e energia', image: creatinaGummyImg },
  { label: 'Rotina e bem-estar', image: pulseFlexImg },
  { label: 'Beleza', image: belezaCategoriaImg },
]

export const featuredProducts = productCatalog.slice(0, 3)

const homeShowcaseIds = ['brain-fuel', 'creatina-gummy', 'pulse-flex', 'melatonina', 'creatina-pura', 'cabelo-pele-unha']

export const homeShowcaseProducts = homeShowcaseIds
  .map((id) => productCatalog.find((product) => product.id === id))
  .filter((product): product is Product => Boolean(product))

const comboIds = ['brain-fuel-kit-2', 'creatina-gummy-kit', 'pulse-flex-kit']

export const combos = comboIds.map((id) => productCatalog.find((product) => product.id === id)).filter((product): product is Product => Boolean(product))

export const routineProductOrder = ['melatonina', 'melatonina-kit-2', 'melatonina-kit-3', 'pulse-flex', 'pulse-flex-kit', 'pulse-flex-kit-3']

export const performanceProductOrder = [
  'brain-fuel',
  'brain-fuel-kit-2',
  'brain-fuel-kit-3',
  'creatina-gummy',
  'creatina-gummy-kit-2',
  'creatina-gummy-kit',
  'creatina-pura',
  'creatina-pura-kit-2',
  'pulse-power',
]
