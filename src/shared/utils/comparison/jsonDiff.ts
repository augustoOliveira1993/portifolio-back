/**
 * Compara dois objetos JSON e retorna um objeto com as diferenças
 * @param oldData - Objeto com dados antigos
 * @param newData - Objeto com dados novos
 * @returns Objeto com as diferenças { campo: { old: valor_antigo, new: valor_novo } }
 */
export function getDiffJson(
  oldData: Record<string, any>,
  newData: Record<string, any>,
): Record<string, { old: any; new: any }> {
  const diff: Record<string, { old: any; new: any }> = {};

  // Função para verificar igualdade
  const isEqual = (a: any, b: any): boolean => {
    if (a === b) return true; // Comparação estrita para tipos primitivos
    if (typeof a === 'object' && typeof b === 'object') {
      return JSON.stringify(a) === JSON.stringify(b); // Comparação para objetos e arrays
    }
    return false; // Diferente em qualquer outro caso
  };

  for (const key in newData) {
    if (newData.hasOwnProperty(key)) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      // Adiciona ao diff apenas se forem realmente diferentes
      if (!isEqual(oldValue, newValue)) {
        diff[key] = { old: oldValue, new: newValue };
      }
    }
  }

  return diff;
}
