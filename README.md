# Pulsepro

Loja responsiva de suplementos feita com React, TypeScript, Vite e Tailwind CSS. O projeto já inclui vitrine, páginas de produto, carrinho, login/cadastro, checkout, cupons, dashboard administrativo e base de integração com Pagar.me.

## Rodar localmente

```bash
npm install
npm run dev
```

## Validar antes de publicar

```bash
npm run check
```

Esse comando roda lint e build de produção.

## Configuração e segredos

Este projeto evita salvar chaves secretas no repositório. Use variáveis de ambiente no seu ambiente local/servidor ou um secret manager no provedor de hospedagem.

- Local (temporário para a sessão):

```bash
export PAGARME_SECRET_KEY=sk_test_xxx
export VITE_PAGARME_PUBLIC_KEY=pk_test_xxx
export VITE_API_URL=http://localhost:4000
export ALLOWED_ORIGINS=http://localhost:5174
npm run dev
```

- Modelo local (arquivo de exemplo): existe `server/config.sample.json` — copie para `server/config.json` apenas no seu ambiente local e não comite.

Nunca comite `PAGARME_SECRET_KEY` ou quaisquer segredos no repositório. Use o painel do provedor (Vercel/Netlify/Heroku/AWS/GCP) para armazenar segredos em produção.

## Servidor

```bash
cd server
npm install
npm run dev
```

Rotas principais:

- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/products`
- `DELETE /api/products/:id`
- `POST /api/payments/create-order`

Notas sobre pagamentos (Pagar.me)

- Para testar boleto: envie `customer.document` (CPF/CNPJ) no payload; o backend cria o pedido e retorna `charges[0].last_transaction` com `url`, `pdf`, `line` e `qrcode`.
- Para cartão: implemente tokenização client-side usando a SDK do Pagar.me; envie apenas `cardToken` para o backend.
- Em produção, use as chaves do painel (sandbox/test e live) via variáveis de ambiente.

## Dashboard

Acesse:

```text
/admin-3f2b9a
```

O dashboard gerencia:

- visão geral de visitas, pedidos e receita;
- pedidos com dados de envio;
- cupons com validade, valor, status e uso único por cliente;
- produtos com edição, remoção e upload/arraste de imagem.

## Checkout

O checkout exige login/cadastro antes de finalizar. Ele pede:

- dados do cliente;
- endereço completo;
- CPF/faturamento;
- método de frete;
- cupom;
- método de pagamento.

Cartão não deve salvar número completo no navegador. Em produção, use a chave pública do Pagar.me para tokenizar o cartão no front e envie apenas o `card_token` para o servidor.

## Publicação

Na Vercel, configure:

- build command: `npm run build`
- output directory: `dist`
- envs do front: `VITE_PAGARME_PUBLIC_KEY` e `VITE_API_URL`

O backend Express precisa ser publicado separadamente ou convertido para funções serverless.
