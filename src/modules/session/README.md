# Módulo de Sessão e Auditoria

Sistema de gerenciamento de sessões híbrido (JWT + Redis) com auditoria automática e logs enriquecidos.

## 📋 Visão Geral

Este módulo implementa:
- ✅ **Controle de sessão server-side** usando Redis
- ✅ **Sessão única por usuário** (logout automático de sessões anteriores)
- ✅ **Geolocalização de IPs** com cache
- ✅ **Auditoria automática** de todas operações CUD (Create/Update/Delete)
- ✅ **Logs enriquecidos** de sessão com IP, User-Agent, localização e duração

## 🏗️ Arquitetura

### Hybrid Session Pattern

O sistema mantém JWT como meio de autenticação (stateless), mas adiciona metadados de sessão no Redis:

1. **Login**: Cria `sessionId` único armazenado no Redis + inclui no payload do JWT
2. **Validação**: Middleware verifica JWT E valida se sessão existe no Redis
3. **Logout**: Invalida sessão no Redis (token JWT não pode mais ser usado)

### Componentes Principais

```
src/modules/session/
├── dto/
│   └── ISessionDTO.ts              # Interfaces de sessão e localização
├── repositories/
│   ├── ISessionRepository.ts       # Interface do repositório
│   └── implementations/
│       └── SessionRedisRepository.ts # Implementação Redis
├── services/session/
│   ├── GetLocationByIpService.ts   # Geolocalização por IP (ip-api.com)
│   ├── ListSessionsService.ts     # Lista sessões ativas do usuário
│   ├── LogoutService.ts            # Logout de sessão específica
│   ├── LogoutAllSessionsService.ts # Logout de todas as sessões
│   ├── GetCurrentSessionService.ts # Detalhes da sessão atual
│   └── SessionLogService.ts        # Logs enriquecidos de sessão
├── infra/https/
│   ├── controllers/
│   │   └── SessionController.ts    # Controller de sessões
│   └── routes/
│       └── sessionRouter.ts        # Rotas de sessão
└── container/
    └── index.ts                    # Dependency Injection
```

## 🔐 Fluxo de Autenticação

### 1. Login (POST /api/auth/signin)

```json
// Request
{
  "email": "usuario@example.com",
  "password": "senha123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "Usuario",
  "email": "usuario@example.com",
  "roles": [...],
  "isAdmin": false,
  "ability": {...}
}
```

**O que acontece internamente:**

1. Valida credenciais (AD ou local)
2. **Invalida todas sessões anteriores do usuário**
3. Gera `sessionId` (UUID v4)
4. Busca geolocalização do IP (não bloqueia se falhar)
5. Cria sessão no Redis com TTL = tempo de expiração do JWT
6. Adiciona `sessionId` ao payload do JWT
7. Registra log de login com IP, User-Agent e localização
8. Retorna tokens + sessionId

### 2. Requisições Autenticadas

Todas as requisições com token passam pelo `authMiddleware` que:

1. Valida assinatura do JWT
2. **Extrai `sessionId` do payload**
3. **Verifica se sessão existe e está ativa no Redis**
4. Se sessão inválida: retorna 401 + registra log de acesso negado
5. Atualiza `lastActivityAt` da sessão (debounce de 1 minuto)
6. Injeta `req.sessionId` para uso em outros middlewares

### 3. Logout (DELETE /api/sessions/:sessionId)

```json
// Response
{
  "message": "Logout realizado com sucesso"
}
```

**O que acontece:**

1. Valida que usuário é dono da sessão (segurança)
2. Remove sessão do Redis
3. Registra log de logout com duração da sessão
4. Token JWT não pode mais ser usado (validação falha no Redis)

## 📊 Auditoria Automática

### Middleware de Auditoria

Intercepta **automaticamente** todas requisições `POST`, `PUT`, `PATCH`, `DELETE`:

1. Captura snapshot do `req.body` antes da operação
2. Intercepta `res.json()` para capturar resposta
3. Se status 2xx: calcula diff usando `getDiffJson()`
4. Cria log no MongoDB com:
   - `action`: CREATE/UPDATE/DELETE
   - `category`: 'AUDIT'
   - `created_by`: email do usuário
   - `ip`, `userAgent`, `sessionId`, `endpoint`, `statusCode`
   - `diff`: objeto com mudanças `{ campo: { old: valor_antigo, new: valor_novo } }`

### Whitelist de Rotas

Rotas que **não** geram logs de auditoria:
- `/health`
- `/metrics`
- `/swagger`
- `/api-docs`
- `/public`

## 📝 Logs de Sessão

### Eventos Registrados

| Evento             | Category    | Action          | Quando                           |
| ------------------ | ----------- | --------------- | -------------------------------- |
| Login bem-sucedido | SESSION_LOG | LOGIN           | Ao fazer login                   |
| Logout             | SESSION_LOG | LOGOUT          | Ao chamar DELETE /sessions/:id   |
| Acesso negado      | SESSION_LOG | ACCESS_DENIED   | Token válido mas sessão inválida |
| Sessão expirada    | SESSION_LOG | SESSION_EXPIRED | TTL do Redis expirou             |

### Estrutura de Log de Login

```json
{
  "action": "LOGIN",
  "category": "SESSION_LOG",
  "message": "Login realizado com sucesso - São Paulo, SP - Brasil",
  "created_by": "usuario@example.com",
  "ip": "200.123.45.67",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "diff": {
    "location": {
      "country": "Brasil",
      "region": "SP",
      "city": "São Paulo",
      "lat": -23.5475,
      "lon": -46.6361,
      "timezone": "America/Sao_Paulo"
    },
    "createdAt": "2026-04-18T10:30:00.000Z",
    "expiresAt": "2026-04-18T18:30:00.000Z"
  },
  "createdAt": "2026-04-18T10:30:00.000Z"
}
```

### Estrutura de Log de Logout

```json
{
  "action": "LOGOUT",
  "category": "SESSION_LOG",
  "message": "Logout realizado - Duração da sessão: 2h 15m",
  "created_by": "usuario@example.com",
  "ip": "200.123.45.67",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "diff": {
    "sessionDuration": 8100000,
    "createdAt": "2026-04-18T10:30:00.000Z",
    "lastActivityAt": "2026-04-18T12:45:00.000Z"
  },
  "createdAt": "2026-04-18T12:45:00.000Z"
}
```

## 🛠️ API Endpoints

### Gerenciamento de Sessões

Todas as rotas requerem autenticação (`verifyToken`).

#### Listar Sessões Ativas

```http
GET /api/sessions
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "ip": "200.123.45.67",
    "userAgent": "Mozilla/5.0...",
    "location": {
      "country": "Brasil",
      "region": "SP",
      "city": "São Paulo"
    },
    "createdAt": "2026-04-18T10:30:00.000Z",
    "lastActivityAt": "2026-04-18T12:45:00.000Z",
    "expiresAt": "2026-04-18T18:30:00.000Z",
    "isActive": true
  }
]
```

#### Sessão Atual

```http
GET /api/sessions/current
Authorization: Bearer {token}
```

**Response 200:** Objeto da sessão atual

#### Logout de Sessão Específica

```http
DELETE /api/sessions/:sessionId
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### Logout de Todas as Sessões

```http
DELETE /api/sessions
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "3 sessão(ões) encerrada(s) com sucesso",
  "count": 3
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

Nenhuma variável adicional necessária. O sistema usa as configurações existentes:

- **Redis**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`
- **JWT**: `secret`, `REFRESH_SECRET` (em jwt.config.ts)

### Geolocalização

**API Usada:** [ip-api.com](http://ip-api.com) (gratuita, sem necessidade de chave)

- **Cache:** 7 dias no Redis
- **Timeout:** 3 segundos
- **Fallback:** Se API falhar, login continua normalmente (graceful degradation)
- **IPs Privados:** Ignorados automaticamente (localhost, 192.168.x.x, 10.x.x.x, etc)

### TTL de Sessão

O TTL da sessão no Redis é igual ao tempo de expiração do JWT:
- Padrão: 8 horas (configurável por usuário em `tempo_expiracao_token`)
- Refresh Token: JWT expiration + 1 hora

### Debounce de Atividade

Para evitar writes excessivos no Redis:
- `lastActivityAt` é atualizado no máximo 1x por minuto por sessão
- Cache em memória limpa entradas antigas automaticamente (evita memory leak)

## 🔒 Segurança

### Sessão Única por Usuário

Ao fazer login, **todas as sessões anteriores são invalidadas automaticamente**.

**Cenário:**
1. Usuário faz login no navegador A → sessão 1 criada
2. Usuário faz login no navegador B → sessão 1 invalidada, sessão 2 criada
3. Navegador A tenta fazer requisição → recebe 401 "Sessão expirada"

### Validações

- ✅ Usuário só pode listar/deletar próprias sessões
- ✅ Token JWT válido + sessão inválida no Redis = acesso negado
- ✅ SessionId no token é validado contra Redis em toda requisição
- ✅ Logs de acesso negado registram tentativas de uso de sessões expiradas

## 📈 Performance

### Otimizações Implementadas

1. **Debounce de lastActivityAt:** Evita writes excessivos no Redis
2. **Cache de geolocalização:** 7 dias, reduz chamadas à API externa
3. **Auditoria assíncrona:** Não bloqueia resposta HTTP (usa `setImmediate`)
4. **Índices MongoDB:**
   - `{ category: 1, created_by: 1, createdAt: -1 }` - queries de auditoria
   - `{ sessionId: 1, createdAt: -1 }` - logs por sessão

### Estimativa de Carga

**Exemplo: 1000 usuários ativos**

- **Redis Storage:** ~500KB (cada sessão ~500 bytes)
- **MongoDB Logs:** Depende de atividade, mas com TTL index pode-se limpar logs antigos
- **Writes Redis/min:** ~1000 (1 update de atividade por usuário)
- **API Geolocalização:** ~143 chamadas/dia (assumindo cache de 7 dias e renovação gradual)

## 🧪 Testes

### Teste Manual de Sessão Única

1. Obtenha token fazendo login:
```bash
curl -X POST http://localhost:3333/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com", "password": "senha123"}'
```

2. Faça login novamente com mesmo usuário (gera novo sessionId)

3. Tente usar o primeiro token:
```bash
curl -X GET http://localhost:3333/api/sessions \
  -H "Authorization: Bearer {primeiro_token}"
```

**Resultado esperado:** 401 Unauthorized - "Sessão expirada ou encerrada"

### Teste de Auditoria

1. Crie/Atualize/Delete qualquer recurso autenticado
2. Verifique MongoDB:
```javascript
db.logs.find({ category: "AUDIT" }).sort({ createdAt: -1 }).limit(10)
```

**Resultado esperado:** Log com diff das mudanças, IP, sessionId, etc.

### Teste de Logout

1. Obtenha sessionId do token ou liste sessões:
```bash
curl -X GET http://localhost:3333/api/sessions \
  -H "Authorization: Bearer {token}"
```

2. Faça logout:
```bash
curl -X DELETE http://localhost:3333/api/sessions/{sessionId} \
  -H "Authorization: Bearer {token}"
```

3. Tente usar o mesmo token novamente

**Resultado esperado:** 401 Unauthorized

## 📚 Consultas Úteis

### Listar Sessões Ativas no Redis

```bash
redis-cli KEYS "SESSION:USER:*"
```

### Ver Detalhes de uma Sessão

```bash
redis-cli HGETALL "SESSION:USER:{userId}:{sessionId}"
```

### Logs de Login de Usuário Específico

```javascript
db.logs.find({
  category: "SESSION_LOG",
  action: "LOGIN",
  created_by: "usuario@example.com"
}).sort({ createdAt: -1 })
```

### Logs de Auditoria com Mudanças

```javascript
db.logs.find({
  category: "AUDIT",
  diff: { $exists: true, $ne: {} }
}).sort({ createdAt: -1 })
```

### Tempo Médio de Sessão

```javascript
db.logs.aggregate([
  { $match: { category: "SESSION_LOG", action: "LOGOUT" } },
  { $group: {
    _id: null,
    avgDuration: { $avg: "$diff.sessionDuration" }
  }}
])
```

## 🚀 Próximos Passos (Opcionais)

1. **Notificação de novo login:** Enviar email quando detectar login de novo IP/local
2. **Dashboard de sessões ativas:** Interface admin para visualizar e gerenciar sessões
3. **Exportação de logs de auditoria:** Job para exportar logs > 90 dias para S3
4. **Análise de comportamento:** Detectar padrões suspeitos (múltiplos IPs, localizações impossíveis)
5. **2FA Integration:** Adicionar autenticação de dois fatores no login

## 📄 Licença

MIT
