import { Router } from 'express';
import { getUsers, createUser, updateUser, deactivateUser } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/', requireRole('admin'), getUsers);
router.post('/', requireRole('admin'), createUser);
router.put('/:id', requireRole('admin'), updateUser);
router.delete('/:id', requireRole('admin'), deactivateUser);

export default router;
