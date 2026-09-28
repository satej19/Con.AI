import { JWTPayload } from '../middleware/authenticate';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
