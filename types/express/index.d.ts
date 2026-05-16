import { Response } from 'express';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      is_admin?: boolean;
      estrutura_rm?: string;
      sessionId?: string;
    }

    interface Response {
      locals?: {
        cacheKey?: string;
      };
    }
  }
}
