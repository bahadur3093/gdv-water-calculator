import { Router } from 'express';
import { getVillas, createVilla, updateVilla } from './villa.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getVillas);
router.post('/', requireRole('admin'), createVilla);
router.put('/:id', requireRole('admin'), updateVilla);

export default router;
