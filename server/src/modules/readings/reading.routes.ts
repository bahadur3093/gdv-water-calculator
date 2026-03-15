import { Router } from 'express';
import { getReadings, getReadingsByVilla, submitReading } from './reading.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(authenticate);
router.get('/', requireRole('admin'), getReadings);
router.get('/villa/:villaId', getReadingsByVilla);
router.post('/', requireRole('admin', 'reader'), upload.single('photo'), submitReading);

export default router;
