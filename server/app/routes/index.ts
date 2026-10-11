import { Router } from 'express';
import { HealthRoutes } from './health.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/health',
    route: HealthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const RootRoutes = router;
export default router;
