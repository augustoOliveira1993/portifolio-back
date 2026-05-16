import dotenv from 'dotenv';
import { parseExpirationTime } from '@shared/utils/helpers';
dotenv.config();

// Re-exporta parseExpirationTime para uso em outros módulos
export { parseExpirationTime };

interface Config {
  secret: string | undefined;
  refreshSecret?: string | undefined;
  password_default?: string | undefined;
  expiresIn: any;
  expiresInRefreshToken?: any;
}

const config: Config = {
  secret: process.env.SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  password_default: process.env.SENHA_DEFAULT_USER_AVB,
  expiresIn: parseExpirationTime('8h'), // 1 hora
  expiresInRefreshToken: parseExpirationTime('12h'), // 8 hora
};

export default config;
