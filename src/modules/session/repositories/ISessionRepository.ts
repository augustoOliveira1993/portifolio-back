import {
  ICreateSessionDTO,
  ISessionDTO,
  IUpdateSessionActivityDTO,
} from '../dto/ISessionDTO';

export default interface ISessionRepository {
  /**
   * Cria uma nova sessão no Redis
   * @param data Dados da sessão
   * @returns Sessão criada com sessionId gerado
   */
  create(data: ICreateSessionDTO): Promise<ISessionDTO>;

  /**
   * Busca uma sessão por ID
   * @param sessionId ID da sessão
   * @returns Sessão encontrada ou null
   */
  findById(sessionId: string): Promise<ISessionDTO | null>;

  /**
   * Busca todas as sessões ativas de um usuário
   * @param userId ID do usuário
   * @returns Lista de sessões do usuário
   */
  findByUserId(userId: string): Promise<ISessionDTO[]>;

  /**
   * Invalida uma sessão específica
   * @param sessionId ID da sessão
   */
  invalidate(sessionId: string): Promise<void>;

  /**
   * Invalida todas as sessões de um usuário
   * @param userId ID do usuário
   */
  invalidateAll(userId: string): Promise<void>;

  /**
   * Atualiza o timestamp de última atividade de uma sessão
   * @param data Dados de atualização
   */
  updateLastActivity(data: IUpdateSessionActivityDTO): Promise<void>;

  /**
   * Verifica se uma sessão existe e está ativa
   * @param sessionId ID da sessão
   * @returns true se sessão existe e está ativa
   */
  isActive(sessionId: string): Promise<boolean>;
}
