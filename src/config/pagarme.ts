export const pagarmeConfig = {
  accountId: import.meta.env.VITE_PAGARME_ACCOUNT_ID || 'COLOQUE_AQUI_O_ID_DA_CONTA_PAGARME',
  // Public key (client-side). Set via Vite env var VITE_PAGARME_PUBLIC_KEY
  publicKey: import.meta.env.VITE_PAGARME_PUBLIC_KEY || 'COLOQUE_AQUI_A_CHAVE_PUBLICA_PK',
  // Backend API used by the app (server that creates orders)
  // Default to 4001 which is used by our local test runs. Override with Vite env `VITE_PAGARME_API_URL`.
  apiUrl: import.meta.env.VITE_PAGARME_API_URL || 'http://localhost:4001',
}
