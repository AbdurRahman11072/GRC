import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { authMiddleware } from '../../middleware/authMiddleware';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
);

router.post('/refresh', AuthController.refreshSession);

router.get('/me', authMiddleware(), AuthController.getMe);

router.post(
  '/create-user',
  authMiddleware(),
  validateRequest(AuthValidation.createUserValidationSchema),
  AuthController.createUser
);

export const AuthRoutes = router;
export default router;


