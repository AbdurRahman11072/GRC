import { Router } from 'express';
import { HealthRoutes } from './health.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { OrganizationRoutes } from '../modules/organization/organization.routes';
import { CRMRoutes } from '../modules/crm/crm.routes';
import { ProjectRoutes } from '../modules/project/project.routes';

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
  {
    path: '/crm',
    route: CRMRoutes,
  },
  {
    path: '/projects',
    route: ProjectRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const RootRoutes = router;
export default router;
