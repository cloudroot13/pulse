#!/usr/bin/env bash
set -euo pipefail

# Usage: TARGET_URL=https://your-ngrok-url ./scripts/test-payments.sh

TARGET=${TARGET_URL:-}
if [ -z "$TARGET" ]; then
  echo "Usage: TARGET_URL=https://your-ngrok-url $0"
  exit 1
fi

echo "Testing payments endpoint at: $TARGET"

echo "\n1) Boleto test (safe)"
curl -s -X POST "$TARGET/api/payments/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "customer":{"name":"Cliente Teste","email":"teste@ex.com","phone":"61999999999","document":"12345678909"},
    "items":[{"id":"p1","name":"Produto Teste","unitPrice":10.00,"quantity":1}],
    "total":10.00,
    "paymentMethod":"boleto"
  }' | jq . || true

echo "\n2) PIX test (if provider supports)"
curl -s -X POST "$TARGET/api/payments/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "customer":{"name":"Cliente Pix","email":"pix@teste.com","phone":"61999999999","document":"12345678909"},
    "items":[{"id":"p2","name":"Produto Pix","unitPrice":5.00,"quantity":1}],
    "total":5.00,
    "paymentMethod":"pix"
  }' | jq . || true

echo "\n3) Credit card test (requires cardToken). If you have a client-side token, set CARD_TOKEN env var."
if [ -z "${CARD_TOKEN:-}" ]; then
  echo "No CARD_TOKEN provided — skipping credit-card test. To run, set CARD_TOKEN and re-run. Example: CARD_TOKEN=tok_xxx TARGET_URL=... $0"
else
  curl -s -X POST "$TARGET/api/payments/create-order" \
    -H "Content-Type: application/json" \
    -d '{
      "customer":{"name":"Cliente Cartao","email":"cartao@teste.com","phone":"61999999999","document":"12345678909"},
      "items":[{"id":"p3","name":"Produto Cartao","unitPrice":15.00,"quantity":1}],
      "total":15.00,
      "paymentMethod":"credit_card",
      "cardToken":"'"${CARD_TOKEN}"'",
      "installments":1
    }' | jq . || true
fi

echo "\nDone. Check server logs and ngrok inspector (http://127.0.0.1:4040) for webhook events."
