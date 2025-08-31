# Sistema de Cobrança (Seeyu Challenge)

Sistema que:
1. Recebe um **CSV** via API com dívidas  
2. **Gera boletos** e **envia e-mails** regularmente  
3. Recebe **webhook** de pagamento do banco e **dá baixa** no débito  

Arquitetura em camadas com traços de **DDD + Ports & Adapters**  
(Services, Providers, Repositories), **Prisma + PostgreSQL** e **Express**.

---

## Pré-requisitos
- Node.js 18+  
- Docker (para rodar Postgres em dev)

---

## ⚙️ Configuração

### `.env.example`
```ini
# Servidor
PORT=3000

# Banco (Postgres via Docker)
DATABASE_URL="postgresql://dev:dev@localhost:5432/cobranza?schema=public"

# Segurança
WEBHOOK_SECRET=dev-secret
CRON_TOKEN=dev-cron-token        # opcional: protege o endpoint de billing
BILLING_RUN_URL=http://127.0.0.1:3000/billing/run

# Mail
MAIL_MODE=mock                   # mock | ethereal | smtp
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Billing
BILLING_BATCH_SIZE=100
MAIL_RATE_DELAY_MS=350
```

### Subir DB
```bash
npm run db:up        # sobe postgres no docker-compose
npm run db:migrate   # aplica migrations do prisma
```

---

## Rodando
```bash
npm install
npm run dev
# -> Server on :3000
```

---

## 📡 API

### Importar CSV
`POST /imports` (multipart, campo `file`)  
Exemplo:
```bash
curl -F "file=@src/data/dados_cobranca_seeyu.csv" http://localhost:3000/imports
```

### Rodar Billing
`POST /billing/run`  
Se `CRON_TOKEN` estiver ativo, enviar header:
```bash
curl -X POST http://localhost:3000/billing/run -H "Authorization: Bearer dev-cron-token"
```

### Stats de Billing
`GET /billing/stats`

### Webhook de Pagamento
`POST /webhooks/payments` com header `X-Signature: <hmac>`  
Payload:
```json
{
  "debtId": "8291",
  "paidAt": "2022-06-09 10:00:00",
  "paidAmount": 100000.00,
  "paidBy": "John Doe"
}
```

### Listar Dívidas (debug/dev)
`GET /debts`

---

## Testes
```bash
npm test
# com cobertura
npm run test:cov
```

- Unitários: ImportService, BillingService, WebhookService  
- Integração: /imports, /billing/run, /webhooks/payments  
- Erros: 401 em webhook sem assinatura, 401 em billing sem token  

---

## Boas práticas aplicadas
- **SOLID** e separação por camadas (Controllers, Services, Providers, Repos)  
- **Idempotência** (`upsert` no import, no-op se já estiver `PAID`)  
- **Error handling centralizado** (`AppError` + middleware)  
- **Validação com Zod** para CSV e Webhook  
- **Webhook assinado** com HMAC-SHA256 (`X-Signature`)  
- **Tests** unitários e de integração cobrindo fluxos principais e de erro  

---

## 📄 Licença
MIT
