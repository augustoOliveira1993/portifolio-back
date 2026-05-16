import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { logger } from '@shared/utils/logger';

/**
 * Configuração e cliente do Microsoft Graph
 */
export class MicrosoftGraphConfig {
  private static client: Client | null = null;
  private static credential: ClientSecretCredential | null = null;

  /**
   * Inicializa o cliente do Microsoft Graph
   */
  public static initialize(): void {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      logger.warn(
        '[Microsoft Graph] Credenciais do Azure não configuradas. Emails não serão enviados.',
      );
      return;
    }

    try {
      // Cria as credenciais usando Azure Identity
      this.credential = new ClientSecretCredential(
        tenantId,
        clientId,
        clientSecret,
      );

      // Cria o provider de autenticação
      const authProvider = new TokenCredentialAuthenticationProvider(
        this.credential,
        {
          scopes: ['https://graph.microsoft.com/.default'],
        },
      );

      // Inicializa o cliente do Graph
      this.client = Client.initWithMiddleware({
        authProvider: authProvider,
      });

      logger.info('[Microsoft Graph] Cliente inicializado com sucesso');
    } catch (error) {
      logger.error('[Microsoft Graph] Erro ao inicializar cliente', { error });
      this.client = null;
      this.credential = null;
    }
  }

  /**
   * Retorna o cliente do Microsoft Graph
   */
  public static getClient(): Client | null {
    if (!this.client) {
      this.initialize();
    }
    return this.client;
  }

  /**
   * Verifica se o cliente está configurado
   */
  public static isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Testa a conexão com o Microsoft Graph
   */
  public static async testConnection(): Promise<boolean> {
    const client = this.getClient();

    if (!client) {
      return false;
    }

    try {
      // Tenta fazer uma requisição simples para verificar a conexão
      await client.api('/me').get();
      logger.info('[Microsoft Graph] Teste de conexão bem-sucedido');
      return true;
    } catch (error) {
      logger.error('[Microsoft Graph] Erro no teste de conexão', { error });
      return false;
    }
  }
}
