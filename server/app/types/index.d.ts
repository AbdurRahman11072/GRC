import { IJwtPayload } from '../modules/auth/auth.interface';
import { OrgRole } from '../../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
      orgId?: string;
      orgRole?: OrgRole;
    }
  }
}

