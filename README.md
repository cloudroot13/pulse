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

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```bash
VITE_PAGARME_PUBLIC_KEY=pk_test_sua_chave_publica
VITE_API_URL=http://localhost:4000
```

Crie também `server/.env` com:

```bash
JWT_SECRET=troque_esse_segredo
PORT=4000
ADMIN_USER=admin
ADMIN_PASS=sua_senha_forte
PAGARME_SECRET_KEY=sk_test_sua_chave_secreta
PAGARME_API_URL=https://api.pagar.me/core/v5
```

Nunca coloque `PAGARME_SECRET_KEY` em arquivos dentro de `src/` ou em `.env.example`.

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
