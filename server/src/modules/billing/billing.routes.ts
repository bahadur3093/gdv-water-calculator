import { Router } from 'express';
import { getBills, getBillsByVilla, getBillById, sendBillEmail, markAsPaid } from './billing.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getBills);
router.get('/villa/:villaId', getBillsByVilla);
router.get('/:id', getBillById);
router.post('/:id/send-email', requireRole('admin'), sendBillEmail);
router.put('/:id/mark-paid', requireRole('admin'), markAsPaid);

export default router;
