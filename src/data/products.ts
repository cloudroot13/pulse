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
import creatinaPuraKit3Img from '../assets/produtos/performance_energia/creatina-pure/Creatina-3.webp'
import creatinaPuraImg from '../assets/produtos/performance_energia/creatina-pure/Creatina.webp'
import pulsePowerImg from '../assets/produtos/performance_energia/pulse-power/Pulse-Power.webp'
import pulsePowerKit2Img from '../assets/produtos/performance_energia/pulse-power/Pulse-Power-2.webp'
import pulsePowerKit3Img from '../assets/produtos/performance_energia/pulse-power/Pulse-Power-3.webp'
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
export function generateSmartDescription(product: Product): string {
  // Conservative description: only rephrases existing product fields.
  const parts: string[] = []
  if (product.subtitle) parts.push(product.subtitle)

  if (product.benefits && product.benefits.length) {
    parts.push(`Principais benefícios: ${product.benefits.join(', ')}.`)
  }

  if (product.ingredients && product.ingredients.length) {
    parts.push(`Ingredientes: ${product.ingredients.join(', ')}.`)
  }

  if (product.usage) parts.push(`Como usar: ${product.usage}`)

  if (product.description) parts.push(product.description)

  // If nothing else, fall back to name and category
  if (!parts.length) parts.push(`${product.name}${product.category ? ` — ${product.category}` : ''}`)

  return parts.join(' ')
}

export function generateSmartShort(product: Product, maxChars = 140): string {
  // Prefer subtitle or description, otherwise truncate the conservative full text.
  if (product.subtitle && product.subtitle.length <= maxChars) return product.subtitle
  if (product.description && product.description.length <= maxChars) return product.description

  const full = generateSmartDescription(product)
  if (full.length <= maxChars) return full
  return full.slice(0, maxChars).replace(/\s+[^\s]*$/, '') + '...'
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
    gallery: [creatinaGummyKit3Img, creatinaGummyKit2Img, creatinaGummyImg],
    image: creatinaGummyImg,
  },
  {
    id: 'pulse-flex',
    category: 'Rotina e bem-estar',
    name: 'Pulse Flex - dores articulares',
    price: 'R$89,90',
    tag: 'Bem-estar',
    subtitle: 'Suporte para mobilidade e conforto no dia a dia.',
    description: `Fórmula desenvolvida para promover o cuidado integral das articulações, ajudando a reduzir inflamações, aliviar dores e melhorar a mobilidade. Com ingredientes que atuam diretamente na regeneração da cartilagem e no fortalecimento dos tecidos articulares, este suplemento oferece suporte para quem busca mais conforto, flexibilidade e qualidade de vida, especialmente em casos de desgaste natural ou sobrecarga.

Benefícios:

🛡️ Reduz inflamações e desconfortos nas articulações! 🤸 Alivia dores e promove maior flexibilidade! 🧩 Auxilia na regeneração da cartilagem! 🚶 Melhora a mobilidade e a qualidade de vida

Um frasco contém 60 cápsulas. Sua recomendação diária é de 2 cápsulas por dia.`,
    details: 'Pensado para pessoas que querem cuidar das articulacoes e manter uma rotina mais leve para se movimentar.',
    benefits: ['Reduz inflamações e desconfortos nas articulações', 'Alivia dores e promove maior flexibilidade', 'Auxilia na regeneração da cartilagem', 'Melhora a mobilidade e a qualidade de vida'],
    ingredients: ['Colageno tipo 2', 'Curcuma', 'Capsulas praticas'],
    usage: 'Um frasco contém 60 cápsulas. Recomendação diária: 2 cápsulas por dia.',
    gallery: [pulseFlexKit3Img, pulseFlexKit2Img, pulseFlexImg],
    image: pulseFlexImg,
  },
  {
    id: 'pulse-power',
    category: 'Performance e energia',
    name: 'Pulse Power',
    price: 'R$119,90',
    tag: 'Performance',
    subtitle: 'Pre-treino para foco, disposicao e intensidade.',
    description: `Suplemento pré-treino desenvolvido para quem busca mais energia, foco, força e desempenho máximo nos treinos. Sua fórmula combina aminoácidos, compostos energéticos e ingredientes que auxiliam na performance física, ajudando o corpo a suportar treinos mais intensos e produtivos.

Com ativos como Creatina, Beta Alanina, L-Arginina e Taurina, esse pré-treino atua no fornecimento de energia rápida, melhora da resistência muscular e aumento da força, além de contribuir para uma melhor oxigenação dos músculos e atraso da fadiga. O resultado é mais explosão, disposição e rendimento do início ao fim do treino — tudo isso com um sabor agradável de maçã verde e kiwi ice, que torna a suplementação ainda mais prazerosa.

Benefícios:`,
    details: 'Formula criada para quem precisa de mais energia e foco antes dos treinos, com comunicacao clara para venda online.',
    benefits: ['Aumenta a energia e a disposição para o treino', 'Contribui para força, potência e resistência muscular', 'Auxilia no atraso da fadiga e melhora do rendimento físico', 'Favorece foco e concentração durante os exercícios', 'Potencializa treinos de alta intensidade e explosão'],
    ingredients: ['Creatina', 'Beta Alanina', 'L-Arginina', 'Taurina'],
    usage: 'Conteúdo: 300g. Recomendação de uso: 15 g ao dia (1 scoop ou 1 colher de sopa). Modo de preparo: Diluir em 200 ml de água ou bebida de sua preferência.',
    image: pulsePowerImg,
  },
  {
    id: 'cabelo-pele-unha',
    name: 'Cabelo, Pele e Unha',
    price: 'R$89,90',
    tag: 'Beleza',
    category: 'Beleza',
    subtitle: 'Cuidado diario para beleza de dentro para fora.',
    description: `Fórmula especialmente desenvolvida para fortalecer os fios, melhorar a saúde das unhas e proporcionar uma pele mais hidratada, firme e luminosa. Com nutrientes essenciais que atuam de dentro para fora, promove o crescimento saudável do cabelo, aumenta a resistência das unhas e mantém a elasticidade e o viço da pele. Ideal para quem busca realçar a beleza natural com resultados visíveis e duradouros.

Benefícios:

💇 Fortalece e estimula o crescimento dos cabelos! 💅 Melhora a resistência e saúde das unhas! 💧 Hidrata e confere elasticidade à pele! ✨ Proporciona vitalidade e aparência saudável

Um frasco contém 60 cápsulas. Sua recomendação diária é de 2 cápsulas por dia.`,
    details: 'Produto indicado para destacar a linha de beleza da marca com foco em autocuidado e consistencia no uso.',
    benefits: ['Fortalece e estimula o crescimento dos cabelos', 'Melhora a resistência e saúde das unhas', 'Hidrata e confere elasticidade à pele', 'Proporciona vitalidade e aparência saudável'],
    ingredients: ['Biotina', 'Selenio', 'Vitaminas selecionadas'],
    usage: 'Um frasco contém 60 cápsulas. Recomendação diária: 2 cápsulas por dia.',
    gallery: [cabeloPeleUnhaKit3Img, cabeloPeleUnhaKit2Img, cabeloPeleUnhaImg],
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
    description: `Suplemento alimentar desenvolvido para quem busca melhorar a qualidade do sono de forma prática e natural. A melatonina é um hormônio produzido naturalmente pelo organismo, responsável por regular o ciclo do sono e vigília, ajudando o corpo a entender o momento certo de relaxar e descansar.

A suplementação com melatonina auxilia na redução do tempo para pegar no sono, contribui para noites mais tranquilas e um descanso reparador. Em comprimidos mastigáveis com sabor agradável de maracujá, o consumo se torna simples e confortável, favorecendo uma rotina noturna mais equilibrada e um despertar com mais disposição.

Benefícios:

🌙 Auxilia na regulação do ciclo do sono! 😴 Contribui para pegar no sono mais rápido! 🛌 Favorece um sono mais profundo e reparador! ⚖️ Ajuda a equilibrar o ritmo biológico! 🌅 Promove mais disposição ao acordar

Conteúdo: 60 comprimidos mastigáveis. Recomendação de uso: 1 comprimido ao dia. Sabor: Maracujá.`,
    details: 'Uma tela pensada para vender bem-estar, com foco em rotina noturna, praticidade e informacoes simples.',
    benefits: ['Auxilia na regulação do ciclo do sono', 'Contribui para pegar no sono mais rápido', 'Favorece um sono mais profundo e reparador', 'Ajuda a equilibrar o ritmo biológico', 'Promove mais disposição ao acordar'],
    ingredients: ['Melatonina', 'Sabor maracuja', 'Comprimidos mastigaveis'],
    usage: '1 comprimido ao dia (conforme recomendação do rótulo).',
    gallery: [melatoninaKit3Img, melatoninaKit2Img, melatoninaImg],
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
    description: `Combinando nutrientes que favorecem a atividade cerebral, este suplemento auxilia no aumento da atenção, da memória e da capacidade de raciocínio. Ideal para quem precisa de mais produtividade nos estudos, no trabalho ou em atividades que exigem alto desempenho mental, promove clareza, energia e equilíbrio para enfrentar os desafios do dia a dia.

Benefícios:

🧠 Melhora o foco e a capacidade de concentração; 🎯 Estimula a memória e o aprendizado; ✨ Favorece clareza e agilidade mental; 🌿 Proporciona mais energia e desempenho intelectual.

Um frasco contém 120 cápsulas. Sua recomendação diária é de 4 cápsulas por dia.`,
    details: 'Produto da linha performance indicado para quem quer reforcar foco em estudos, trabalho e rotina intensa.',
    benefits: ['Melhora o foco e a capacidade de concentração', 'Estimula a memória e o aprendizado', 'Favorece clareza e agilidade mental', 'Proporciona mais energia e desempenho intelectual'],
    ingredients: ['Coenzima Q10', 'Tirosina', 'Colina'],
    usage: '4 cápsulas por dia (conforme recomendação do rótulo).',
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
    id: 'creatina-gummy-kit-3',
    name: 'Creatina Gummy (Kit com 3)',
    price: 'R$349,90',
    oldPrice: 'R$449,70',
    tag: 'Combo',
    subtitle: 'Creatina em gomas mastigaveis para uma rotina mais pratica.',
    description: `Suplemento alimentar desenvolvido para quem busca mais força, energia e desempenho físico, agora em uma forma prática e saborosa. A creatina é um dos suplementos mais estudados e utilizados no mundo esportivo, reconhecida por seu papel no fornecimento de energia rápida para os músculos durante exercícios de alta intensidade.

A versão em gomas mastigáveis sabor uva verde facilita a suplementação diária, sem necessidade de preparo ou diluição. A creatina monohidratada auxilia no aumento da força muscular, melhora da performance nos treinos e apoio à recuperação muscular, tornando-se uma excelente aliada para quem deseja evoluir nos resultados com mais praticidade.

Benefícios:`,
    details: 'Ideal para quem busca praticidade no consumo diario de creatina, com formato facil de carregar e encaixar na rotina.',
    benefits: ['Auxilia no aumento da força e da potência muscular', 'Contribui para mais energia em treinos intensos', 'Melhora o desempenho físico e a capacidade de treino', 'Apoia a recuperação muscular pós-exercício', 'Forma prática e saborosa de suplementação'],
    ingredients: ['Creatina monohidratada', 'Sabor uva verde', 'Gomas mastigaveis'],
    usage: 'Recomendação de uso: 2 gomas ao dia. Conteúdo: 60 gomas mastigáveis. Sabor: Uva verde.',
    image: creatinaGummyKit3Img,
  },

  {
    id: 'pulse-power-kit-2',
    name: 'Pulse Power (Kit com 2)',
    price: 'R$224,90',
    oldPrice: 'R$249,80',
    tag: 'Performance',
    category: 'Performance e energia',
    subtitle: 'Kit com 2 unidades de Pulse Power.',
    description: 'Combo com 2 unidades do pré-treino Pulse Power.',
    details: 'Economia para quem usa Pulse Power regularmente.',
    benefits: ['Economia no kit', 'Mais energia por mais tempo'],
    ingredients: ['Creatina', 'Beta Alanina', 'Taurina'],
    usage: 'Use conforme orientacao de cada produto.',
    gallery: [pulsePowerKit2Img, pulsePowerKit2Img],
    image: pulsePowerKit2Img,
  },
  {
    id: 'pulse-power-kit-3',
    name: 'Pulse Power (Kit com 3)',
    price: 'R$329,90',
    oldPrice: 'R$379,70',
    tag: 'Performance',
    category: 'Performance e energia',
    subtitle: 'Kit com 3 unidades de Pulse Power.',
    description: 'Combo com 3 unidades do pré-treino Pulse Power.',
    details: 'Melhor custo-beneficio para uso continuado.',
    benefits: ['Maior economia', 'Energia prolongada para rotina de treinos'],
    ingredients: ['Creatina', 'Beta Alanina', 'Taurina'],
    usage: 'Use conforme orientacao de cada produto.',
    gallery: [pulsePowerKit3Img, pulsePowerKit3Img, pulsePowerKit3Img],
    image: pulsePowerKit3Img,
  },
  {
    id: 'creatina-pura',
    name: 'Creatina Pura Monohidratada',
    price: 'R$124,90',
    tag: 'Performance',
    category: 'Performance e energia',
    subtitle: 'Creatina monohidratada em po para performance diaria.',
    description: `Suplemento essencial para quem busca aumento de força, resistência e melhora no desempenho físico. A creatina é uma substância natural presente nos músculos, responsável por fornecer energia rápida durante atividades intensas e de curta duração, como treinos de força e explosão. Sua suplementação contribui para a recuperação muscular, aumento da massa magra e maior capacidade para treinos intensos, auxiliando na conquista dos seus objetivos com mais eficiência.

Benefícios:`,
    details: 'Produto essencial para a linha performance, ideal para quem prefere creatina em po e busca um consumo simples no dia a dia.',
    benefits: ['Aumenta a força e a resistência muscular', 'Melhora o desempenho em treinos de alta intensidade', 'Auxilia na recuperação muscular pós-exercício', 'Contribui para o ganho de massa magra'],
    ingredients: ['Creatina monohidratada', 'Formato em po', 'Uso diario'],
    usage: 'Um frasco contém 200 gramas de creatina em pó. Recomendação diária: 5 gramas por dia.',
    gallery: [creatinaPuraKit2Img, creatinaPuraImg],
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
    id: 'creatina-pura-kit-3',
    name: 'Creatina Pura Monohidratada (Kit com 3)',
    price: 'R$329,90',
    oldPrice: 'R$374,70',
    tag: 'Performance',
    category: 'Performance e energia',
    subtitle: 'Kit com 3 unidades de creatina pura.',
    description: 'Combo de creatina pura com maior economia para uso continuado.',
    details: 'Opcao para quem quer estocar creatina e economizar no combo.',
    benefits: ['Maior economia', 'Uso continuado garantido', '100% creatina monohidratada'],
    ingredients: ['Creatina monohidratada', 'Formato em po', 'Uso diario'],
    usage: 'Misture em agua ou bebida de preferencia conforme recomendacao do rotulo.',
    gallery: [creatinaPuraKit3Img, creatinaPuraKit3Img, creatinaPuraKit3Img],
    image: creatinaPuraKit3Img,
  },
  {
    id: 'pulse-flex-kit-2',
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

// Post-process kits: inherit main product fields when missing to keep descriptions consistent
productCatalog.forEach((prod) => {
  if (prod.id.includes('-kit')) {
    const baseId = prod.id.split('-kit')[0]
    const base = productCatalog.find((p) => p.id === baseId)
    if (base) {
      prod.description = prod.description || base.description
      prod.details = prod.details || base.details
      prod.benefits = prod.benefits || base.benefits
      prod.ingredients = prod.ingredients || base.ingredients
      prod.usage = prod.usage || base.usage
    }
  }
})

// Ensure unit SKUs use the single-item image (last gallery image) when available.
productCatalog.forEach((prod) => {
  if (!prod.id.includes('-kit') && prod.gallery && prod.gallery.length) {
    prod.image = prod.gallery[prod.gallery.length - 1]
  }
})

export const categoryCarouselItems = [
  { label: 'Todos', image: creatinaGummyKit3Img },
  { label: 'Performance e energia', image: creatinaGummyImg },
  { label: 'Rotina e bem-estar', image: pulseFlexImg },
  { label: 'Beleza', image: belezaCategoriaImg },
]

// Make featured products explicit so we can control which SKUs appear as highlights.
export const featuredProducts = [
  'creatina-pura',
  'creatina-gummy',
  'pulse-power',
].map((id) => productCatalog.find((p) => p.id === id)).filter((p): p is Product => Boolean(p))

// Ensure home showcase contains the core single SKUs
const homeShowcaseIds = ['brain-fuel', 'creatina-pura', 'pulse-flex', 'melatonina', 'creatina-gummy', 'cabelo-pele-unha']

export const homeShowcaseProducts = homeShowcaseIds
  .map((id) => productCatalog.find((product) => product.id === id))
  .filter((product): product is Product => Boolean(product))

// Derive combos dynamically: any product that is a kit (id includes '-kit') or tagged as 'Combo'
export const combos = productCatalog.filter((product) => product.id.includes('-kit') || product.tag === 'Combo')

export const routineProductOrder = ['melatonina', 'melatonina-kit-2', 'melatonina-kit-3', 'pulse-flex', 'pulse-flex-kit-2', 'pulse-flex-kit-3']

export const performanceProductOrder = [
  'brain-fuel',
  'brain-fuel-kit-2',
  'brain-fuel-kit-3',
  'creatina-gummy',
  'creatina-gummy-kit-2',
  'creatina-gummy-kit-3',
  'creatina-pura',
  'creatina-pura-kit-2',
  'pulse-power',
]

// Apply local admin overrides from localStorage (frontend-only admin edits)
try {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem('admin_products')
    if (raw) {
      const overrides = JSON.parse(raw)
      Object.keys(overrides).forEach((id) => {
        const o = overrides[id]
        const idx = productCatalog.findIndex((p) => p.id === id)
        if (o && o.__deleted) {
          if (idx !== -1) productCatalog.splice(idx, 1)
          return
        }
        if (idx !== -1) {
          productCatalog[idx] = { ...productCatalog[idx], ...o }
        } else {
          const productOverride = { ...o }
          delete productOverride.__deleted
          productCatalog.push({ id, ...productOverride } as Product)
        }
      })
    }
  }
} catch {
  console.warn('Nao foi possivel aplicar edicoes locais dos produtos.')
}
