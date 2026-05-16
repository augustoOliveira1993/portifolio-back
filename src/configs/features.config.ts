/**
 * Feature Flags – habilite/desabilite funcionalidades sem precisar de deploy.
 *
 * Cada flag lê uma variável de ambiente. Se não definida, cai no default.
 * Para ativar em produção adicione no .env:  FEATURE_METRICS=true
 */

function bool(envVar: string, defaultValue: boolean): boolean {
  const val = process.env[envVar];
  if (val === undefined) return defaultValue;
  return val === 'true' || val === '1';
}

const features = {
  /** Expõe endpoint /metrics (Prometheus) */
  METRICS: bool('FEATURE_METRICS', true),

  /** Expõe endpoint /health */
  HEALTH_CHECK: bool('FEATURE_HEALTH_CHECK', true),

  /** Rate limiting global */
  RATE_LIMIT: bool('FEATURE_RATE_LIMIT', true),

  /** Helmet (security headers) */
  HELMET: bool('FEATURE_HELMET', true),

  /** Mongo sanitize (previne NoSQL injection) */
  MONGO_SANITIZE: bool('FEATURE_MONGO_SANITIZE', true),

  /** Circuit Breaker em serviços externos */
  CIRCUIT_BREAKER: bool('FEATURE_CIRCUIT_BREAKER', true),

  /** Cache Redis */
  REDIS_CACHE: bool('FEATURE_REDIS_CACHE', true),

  FEATURE_ROUTE_MONITORING: bool('FEATURE_ROUTE_MONITORING', true),

  /** Habilita inicializacao do SocketManager */
  SOCKET_MANAGER: bool('FEATURE_SOCKET_MANAGER', false),

  /** Notificações por email */
  EMAIL_NOTIFICATIONS: bool('FEATURE_EMAIL_NOTIFICATIONS', true),
} as const;

export type FeatureKey = keyof typeof features;

/** Verifica se uma feature está habilitada */
export function isEnabled(feature: FeatureKey): boolean {
  return features[feature];
}

export default features;
