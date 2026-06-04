# Pulsepro

Landing page responsiva para uma loja de suplementos, criada com React, TypeScript, Vite e Tailwind CSS.

## Rodar localmente

```bash
npm install
npm run dev
```

## Validar antes de publicar

```bash
npm run lint
npm run build
```

## Publicar

Depois do build, envie a pasta `dist/` para o provedor de hospedagem.

Funciona bem em Vercel, Netlify, Hostinger com deploy estatico, Cloudflare Pages ou qualquer servidor que sirva arquivos HTML/CSS/JS.

## Onde trocar conteudo

- Produtos em destaque: `featuredProducts` em `src/App.tsx`
- Produtos da vitrine: `shelfProducts` em `src/App.tsx`
- Combos: `combos` em `src/App.tsx`
- Comentarios: `testimonials` em `src/App.tsx`
- Imagem temporaria dos produtos: `src/assets/hero.png`

## Observacoes

As fotos dos comentarios usam placeholders externos. Para producao final, substitua o campo `photo` por imagens reais hospedadas no projeto ou no CDN do cliente.
