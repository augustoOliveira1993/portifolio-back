/**
 * Converte a string de expiração em milissegundos ou segundos
 * @param expiration - String de expiração (ex: '10s', '5m', '2h', '1d') ou número
 * @param unitType - Tipo de unidade de retorno: 'seconds' ou 'milliseconds'
 * @returns Valor numérico em segundos ou milissegundos
 * @throws Error se o formato for inválido
 * @example parseExpirationTime('10s') // 10
 * @example parseExpirationTime('5m', 'milliseconds') // 300000
 */
export function parseExpirationTime(
  expiration: string | number,
  unitType: 'seconds' | 'milliseconds' = 'seconds',
): number {
  const timeUnits: { [key: string]: number } = {
    s: unitType === 'milliseconds' ? 1000 : 1, // segundos
    m: unitType === 'milliseconds' ? 1000 * 60 : 60, // minutos
    h: unitType === 'milliseconds' ? 1000 * 60 * 60 : 3600, // horas
    d: unitType === 'milliseconds' ? 1000 * 60 * 60 * 24 : 86400, // dias
  };

  if (typeof expiration === 'number') {
    return unitType === 'milliseconds' && expiration >= 1000
      ? expiration
      : Math.floor(expiration); // retorna sempre em segundos ou milissegundos diretamente
  }

  const match = expiration.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(
      'Formato inválido. Use algo como "10s", "5m", "2h", ou "1d".',
    );
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  return value * timeUnits[unit]; // Retorna o valor em milissegundos ou segundos
}

/**
 * Calcula a porcentagem de um valor em relação ao total
 * @param value - Valor numérico
 * @param total - Total numérico
 * @returns Porcentagem com 2 casas decimais
 */
export function calculatePercentage(value: number, total: number): number {
  if (value === 0 || total === 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
}
