Subject: Pedido falhando - validation_error | billing | "value" is required

Resumo:
- Ambiente: testes locais (server Node.js em http://localhost:4001)
- Chaves de teste usadas: public key (client) e secret key (server) — confirmar que pertencem à mesma conta
- Sintoma: pedidos criados retornam charge com erro de gateway: `validation_error | billing | "value" is required`.
- Chamadas diretas a `https://api.pagar.me/core/v5/orders` às vezes retornam `404 {"message":"Token not found."}`; `/payments` retornou 404; `/charges` retornou 422 em varreduras.

Passos para reproduzir (executados localmente):

1) Gerar token (public key):
   curl -X POST "https://api.pagar.me/core/v5/tokens?appId=<PUBLIC_KEY>" -H "Content-Type: application/json" -d '{"card":{"number":"4111111111111111","holder_name":"Cliente Teste","exp_month":12,"exp_year":2028,"cvv":"123"}}'

2) Chamar endpoint `/api/payments/create-order` do servidor (usamos keys de teste no processo):
   POST http://localhost:4001/api/payments/create-order
   Body (exemplo):
   - payload salvo em `/tmp/pagarme_last_payload.json` (anexo)

3) Resposta do servidor:
   - pedido criado, mas charge com erro:
     `{"message":"validation_error | billing | \"value\" is required"}`
   - resposta completa salva em `/tmp/pagarme_last_response.json` (anexo)

O que já testamos:
- Incluímos `billing.value` em vários locais: top-level `billing`, `payments[].billing`, `payments[].credit_card.billing`, `payments[].credit_card.transaction.billing` — tanto como string "10.00" quanto como número 10 e como cents (1000).
- Regeneramos um token novo para cada tentativa (tokens expiram rápido).
- Tentamos chamadas diretas a `/orders`, `/payments` e `/charges` com variações de payload e headers.

Resultados dos testes (resumos):
- `/orders` via servidor: pedido criado, charge falha com `validation_error | billing | "value" is required`.
- Chamadas diretas: `/orders` retornou `404 Token not found.` em várias tentativas; `/payments` retornou 404; `/charges` retornou 422 indicando campos `payment` e `customer.type` ausentes quando usamos o formato errado.

Arquivos de debug (anexar):
- /tmp/pagarme_last_payload.json
- /tmp/pagarme_last_response.json
- /tmp/pagarme_test_results.json
- /tmp/brute_results.json
- /tmp/new_token.json (token gerado para reprodução)

Perguntas para o suporte Pagar.me (favor responder):
1) Qual o schema exato esperado para o campo `billing.value` dentro do payload `orders` para a conta vinculada às chaves abaixo? (ex.: string com 2 decimais, número, cents)
2) Por que a API responde `Token not found.` quando usamos token gerado via public key nas chamadas diretas a `/orders` com a mesma `secret key`? Há diferenças de conta ou escopo que devemos conhecer?
3) O recurso `checkout/sessions` e endpoints `/payments` e `/charges` estão habilitados para esta conta de teste? Se não, o que é necessário habilitar?

Informações e metadados:
- Horário dos testes: ver timestamps nos arquivos em `/tmp` (arquivos foram salvos durante 2026-06-22).
- Não incluir a secret key no ticket público; se necessário, posso fornecer os últimos 6 caracteres do `sk_...` para identificação no painel.

Observações finais:
- Já testamos diversas variações de payload e encodings — parece provável que o problema esteja relacionado à conta/chaves ou validação do adquirente. Agradecemos ajuda em confirmar o schema e a configuração da conta.
