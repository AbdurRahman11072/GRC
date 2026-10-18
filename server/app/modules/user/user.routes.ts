import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';

const router = Router();

// 1. Get all system users (SuperAdmin only)
router.get(
  '/',
  authMiddleware(),
  validateRequest(UserValidation.getAllUsersValidationSchema),
  UserController.getAllUsers
);

// 2. Get users by organization ID (Members of org or SuperAdmin)
router.get(
  '/organization/:orgId',
  authMiddleware(),
  validateRequest(UserValidation.getUsersByOrgValidationSchema),
  UserController.getUsersByOrg
);

// 3. Current user updates their own profile
router.patch(
  '/me',
  authMiddleware(),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateMyProfile
);

// 4. Current user changes their password
router.post(
  '/change-password',
  authMiddleware(),
  validateRequest(UserValidation.changePasswordValidationSchema),
  UserController.changePassword
);


// 4. Admin updates user profile or org role
router.patch(
  '/:id',
  authMiddleware(),
  validateRequest(UserValidation.adminUpdateUserValidationSchema),
  UserController.adminUpdateUser
);

export const UserRoutes = router;
export default router;
