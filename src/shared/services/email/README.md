# Módulo de Envio de Email

Sistema completo de envio de emails com templates tipados usando TypeScript e **Microsoft Graph API**.

## 📁 Estrutura

```text
src/shared/services/email/
├── config/
│   └── MicrosoftGraphConfig.ts      # Configuração do Microsoft Graph
├── enums/
│   └── EmailTemplateEnum.ts         # Enum com todos os templates disponíveis
├── interfaces/
│   └── IEmailTemplates.ts           # Interfaces tipadas para cada template
├── templates/
│   ├── aprovacaoRecrutamento.template.ts
│   ├── notificacaoGeral.template.ts
│   ├── boasVindas.template.ts
│   ├── recuperacaoSenha.template.ts
│   ├── confirmacaoCadastro.template.ts
│   └── alertaSistema.template.ts
├── examples/
│   └── EmailExamples.service.ts     # Exemplos de uso
├── EmailService.ts                   # Serviço principal
└── index.ts                          # Exportações centralizadas
```

## ⚙️ Configuração

### 1. Criar App Registration no Azure Portal

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Navegue até **Azure Active Directory** > **App registrations** > **New registration**
3. Configure:
   - **Name**: Sistema de Email (ou outro nome)
   - **Supported account types**: Single tenant
   - Clique em **Register**

### 2. Configurar Permissões

1. No app criado, vá em **API permissions**
2. Clique em **Add a permission** > **Microsoft Graph** > **Application permissions**
3. Adicione as seguintes permissões:
   - `Mail.Send` - Enviar emails como qualquer usuário
4. Clique em **Grant admin consent** para aprovar

### 3. Criar Client Secret

1. Vá em **Certificates & secrets** > **New client secret**
2. **Description**: Email Service Secret
3. **Expires**: Escolha o período (recomendado: 24 meses)
4. Clique em **Add**
5. **IMPORTANTE**: Copie o **Value** do secret imediatamente (não será mostrado novamente)

### 4. Configurar Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
# Microsoft Graph - Credenciais do Azure AD
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=valor_do_secret_copiado

# Email - Endereço remetente
MAIL_FROM_USER=no-reply@empresa.com
```

**Onde encontrar os valores:**

- `AZURE_TENANT_ID`: Azure Portal > Azure Active Directory > Overview > Tenant ID
- `AZURE_CLIENT_ID`: Azure Portal > App Registration > Overview > Application (client) ID
- `AZURE_CLIENT_SECRET`: O valor copiado na criação do secret
- `MAIL_FROM_USER`: Email do remetente (deve existir no Office 365/Microsoft 365)

### 5. Instalar Dependências

```bash
npm install @azure/identity @microsoft/microsoft-graph-client
```

## 🚀 Como Usar

### 1. Injeção de Dependência

```typescript
import { injectable } from 'tsyringe';
import EmailService from '@shared/services/email/EmailService';

@injectable()
export default class MeuService {
  constructor(private emailService: EmailService) {}
}
```

### 2. Enviar Email com Template

```typescript
import { EmailTemplateEnum } from '@shared/services/email';

// Enviar email de boas-vindas
const result = await this.emailService.sendTemplateEmail({
  to: 'usuario@empresa.com',
  subject: 'Bem-vindo ao Sistema',
  template: EmailTemplateEnum.BOAS_VINDAS,
  data: {
    nomeUsuario: 'João Silva',
    linkAcessoSistema: 'https://sistema.com/login',
    informacoesAdicionais: 'Acesse o sistema e comece a usar!',
  },
});

console.log(result.sent ? 'Email enviado!' : 'Falha no envio');
```

### 3. Templates Disponíveis

#### 📧 Aprovação de Recrutamento

```typescript
await emailService.sendTemplateEmail({
  to: 'aprovador@empresa.com',
  subject: 'Aprovação de Solicitação',
  template: EmailTemplateEnum.APROVACAO_DIRETOR,
  data: {
    aprovadorNome: 'João Silva',
    posicao: 'Desenvolvedor',
    codigo: 12345,
    linkAprovar: 'https://...',
    linkReprovar: 'https://...',
  },
});
```

#### 📢 Notificação Geral

```typescript
await emailService.sendTemplateEmail({
  to: 'usuario@empresa.com',
  subject: 'Atualização do Sistema',
  template: EmailTemplateEnum.NOTIFICACAO_GERAL,
  data: {
    titulo: 'Nova Atualização',
    mensagem: 'O sistema foi atualizado!',
    acaoPrincipal: {
      texto: 'Ver Novidades',
      link: 'https://...',
    },
  },
});
```

#### 👋 Boas-vindas

```typescript
await emailService.sendTemplateEmail({
  to: 'novo@empresa.com',
  subject: 'Bem-vindo!',
  template: EmailTemplateEnum.BOAS_VINDAS,
  data: {
    nomeUsuario: 'Maria',
    linkAcessoSistema: 'https://...',
  },
});
```

#### 🔑 Recuperação de Senha

```typescript
await emailService.sendTemplateEmail({
  to: 'usuario@empresa.com',
  subject: 'Recuperação de Senha',
  template: EmailTemplateEnum.RECUPERACAO_SENHA,
  data: {
    nomeUsuario: 'Pedro',
    linkRecuperacao: 'https://...',
    expiracaoLink: '1 hora',
  },
});
```

#### ✅ Confirmação de Cadastro

```typescript
await emailService.sendTemplateEmail({
  to: 'novo@empresa.com',
  subject: 'Confirme seu Cadastro',
  template: EmailTemplateEnum.CONFIRMACAO_CADASTRO,
  data: {
    nomeUsuario: 'Ana',
    linkConfirmacao: 'https://...',
    expiracaoLink: '24 horas',
  },
});
```

#### ⚠️ Alerta do Sistema

```typescript
await emailService.sendTemplateEmail({
  to: 'admin@empresa.com',
  subject: 'Alerta do Sistema',
  template: EmailTemplateEnum.ALERTA_SISTEMA,
  data: {
    tipoAlerta: 'warning', // 'info' | 'warning' | 'error' | 'success'
    titulo: 'Manutenção Programada',
    mensagem: 'O sistema ficará offline...',
    detalhes: 'Detalhes adicionais...',
    linkAcao: 'https://...',
    textoAcao: 'Ver Detalhes',
  },
});
```

### 4. Enviar Email Simples (sem template)

```typescript
await emailService.sendSimpleEmail({
  to: 'usuario@empresa.com',
  subject: 'Assunto',
  html: '<p>Conteúdo HTML</p>',
  text: 'Conteúdo texto',
});
```

### 5. Enviar Múltiplos Emails

```typescript
const emails = [
  {
    to: 'usuario1@empresa.com',
    subject: 'Assunto 1',
    template: EmailTemplateEnum.BOAS_VINDAS,
    data: { nomeUsuario: 'User 1' },
  },
  {
    to: 'usuario2@empresa.com',
    subject: 'Assunto 2',
    template: EmailTemplateEnum.BOAS_VINDAS,
    data: { nomeUsuario: 'User 2' },
  },
];

const result = await emailService.sendBatchEmails(emails);
console.log(`Enviados: ${result.sent}, Falhas: ${result.failed}`);
```

### 6. Opções Avançadas

#### Email com CC e BCC

```typescript
await emailService.sendTemplateEmail({
  to: 'principal@empresa.com',
  cc: ['copia1@empresa.com', 'copia2@empresa.com'],
  bcc: 'copiaOculta@empresa.com',
  subject: 'Relatório',
  template: EmailTemplateEnum.NOTIFICACAO_GERAL,
  data: {
    /* ... */
  },
});
```

#### Verificar Configuração

```typescript
// Verificar se está configurado
const isConfigured = emailService.isConfigured();

// Verificar conexão SMTP
const isConnected = await emailService.verifyConnection();
```

## 🎨 Criar Novo Template

### 1. Adicionar no Enum

```typescript
// enums/EmailTemplateEnum.ts
export enum EmailTemplateEnum {
  // ... existentes
  MEU_NOVO_TEMPLATE = 'MEU_NOVO_TEMPLATE',
}
```

### 2. Criar Interface

```typescript
// interfaces/IEmailTemplates.ts
export interface IMeuNovoTemplateData {
  titulo: string;
  mensagem: string;
  // ... outros campos
}
```

### 3. Criar Template HTML

```typescript
// templates/meuNovoTemplate.template.ts
import { IMeuNovoTemplateData } from '../interfaces/IEmailTemplates';

export function meuNovoTemplate(data: IMeuNovoTemplateData): string {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>${data.titulo}</h1>
        <p>${data.mensagem}</p>
      </body>
    </html>
  `;
}
```

### 4. Adicionar no EmailService

```typescript
// EmailService.ts
import { meuNovoTemplate } from './templates/meuNovoTemplate.template';

// No método getTemplate:
case EmailTemplateEnum.MEU_NOVO_TEMPLATE:
  return meuNovoTemplate(data as IMeuNovoTemplateData);
```

## 📝 Exemplos Completos

Veja o arquivo [`EmailExamples.service.ts`](./examples/EmailExamples.service.ts) para exemplos completos de uso de todos os templates.

## 🔍 Logs

O serviço registra logs automáticos para:

- ✅ Inicialização do transporter
- 📧 Emails enviados com sucesso
- ❌ Erros no envio
- 📊 Resultados de envios em lote

## 🛡️ Tratamento de Erros

Todos os métodos retornam um objeto com status:

```typescript
{
  sent: boolean;
  messageId?: string;  // ID da mensagem (se enviado)
  error?: string;      // Mensagem de erro (se falhou)
}
```

## 💡 Dicas

1. **Variáveis de Ambiente**: Configure corretamente as credenciais do Azure AD
2. **Templates Responsivos**: Todos os templates são responsivos para mobile
3. **Segurança**: Nunca commite secrets no código, use `.env` e `.gitignore`
4. **Permissões**: Certifique-se de que o app tem `Mail.Send` permission
5. **Remetente**: O email em `MAIL_FROM_USER` deve existir no seu tenant
6. **Logs**: Monitore os logs para identificar problemas de envio
7. **Client Secret**: Renove o secret antes de expirar para não interromper o serviço

## 🔒 Segurança

- O Client Secret é sensível - trate como senha
- Use Azure Key Vault em produção para armazenar secrets
- Configure token de curta duração quando possível
- Revise regularmente as permissões concedidas ao app
- Monitore logs de envio para detectar uso indevido

## 🔧 Troubleshooting

### Erro: "Insufficient permissions"

- Verifique se as permissões `Mail.Send` foram concedidas
- Confirme que o admin consent foi dado

### Erro: "Invalid credentials"

- Verifique se o AZURE_TENANT_ID, CLIENT_ID e CLIENT_SECRET estão corretos
- Confirme que o secret não expirou

### Erro: "Mailbox not found"

- Verifique se o MAIL_FROM_USER existe no Microsoft 365
- Confirme que o email está ativo

### Emails não estão sendo enviados

- Execute `verifyConnection()` para testar a conexão
- Verifique os logs para mensagens de erro detalhadas

## 📚 Recursos

- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/api/user-sendmail)
- [Azure App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph SDK for JavaScript](https://github.com/microsoftgraph/msgraph-sdk-javascript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [HTML Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)

## 🆚 Vantagens do Microsoft Graph

- ✅ **Autenticação Corporativa**: Integrado com Azure AD
- ✅ **Sem SMTP**: Não precisa configurar servidor SMTP
- ✅ **Segurança**: Autenticação OAuth 2.0
- ✅ **Confiabilidade**: Infraestrutura Microsoft
- ✅ **Auditoria**: Logs integrados no Office 365
- ✅ **Escalabilidade**: Suporta alto volume de emails

---

**Criado em**: 27/02/2026
**Autor**: Sistema AVB Ferroeste
**Tecnologia**: Microsoft Graph API + TypeScript
**Autor**: Sistema AVB Ferroeste
