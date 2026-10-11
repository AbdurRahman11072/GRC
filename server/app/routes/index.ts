import { Router } from 'express';
import { HealthRoutes } from './health.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { OrganizationRoutes } from '../modules/organization/organization.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/health',
    route: HealthRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth/users',
    route: UserRoutes,
  },
  {
    path: '/organizations',
    route: OrganizationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const RootRoutes = router;
export default router;
