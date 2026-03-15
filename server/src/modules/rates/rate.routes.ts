import { Router } from 'express';
import { getRates, getCurrentRate, createRate } from './rate.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getRates);
router.get('/current', getCurrentRate);
router.post('/', requireRole('admin'), createRate);

export default router;
