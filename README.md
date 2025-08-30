# Sistema de Cobrança (Seeyu Challenge)

Sistema que:
1. Recebe um **CSV** via API com dívidas  
2. **Gera boletos** e **envia e-mails** regularmente  
3. Recebe **webhook** de pagamento do banco e **dá baixa** no débito

Arquitetura em camadas com traços de **DDD + Ports & Adapters** (Services, Providers, Repos), **Prisma + PostgreSQL** e **Express**.

---

## Pré-requisitos
- Node.js 18+
- Docker (para rodar Postgres)

---

## Configuração

### .env example
```ini
PORT=3000
DATABASE_URL="postgresql://dev:dev@localhost:5432/cobranza?schema=public"
WEBHOOK_SECRET=dev-secret
MAIL_MODE=mock
```

### Subir DB
```bash
npm run db:up
npm run db:migrate
```

---

## Rodando
```bash
npm install
npm run dev
# -> Server on :3000
```

---

## API

### Importar CSV
`POST /imports` (multipart, campo `file`)

### Rodar Billing
`POST /billing/run`

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

### Listar Dívidas
`GET /debts`

---

## Testes
```bash
npm test
npm run lint
```

---

## Boas práticas aplicadas
- SOLID
- Idempotência (`upsert` e status `PAID`)
- Error handling centralizado
- Validação com Zod
- Webhook assinado com HMAC-SHA256

---

## Licença
MIT
