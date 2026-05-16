/**
 * Re-exporta do middleware global de autenticação.
 * A implementação real está em @shared/middlewares/authMiddleware.ts
 *
 * Este arquivo existe para manter compatibilidade com imports internos do módulo users.
 * Para novos módulos, importe diretamente de '@shared/middlewares/authMiddleware'.
 */
export {
  verifyToken,
  generateToken,
  generateRefreshToken,
} from '@shared/middlewares/authMiddleware';

import {
  verifyToken,
  generateToken,
  generateRefreshToken,
} from '@shared/middlewares/authMiddleware';

const authJwt = {
  verifyToken,
  generateToken,
  generateRefreshToken,
};

export default authJwt;
