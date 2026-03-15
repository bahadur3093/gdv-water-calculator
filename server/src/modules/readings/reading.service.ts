import { Reading } from './reading.model';
import { ApiError } from '../../utils/ApiError';
import { uploadPhoto } from '../../services/cloudinary.service';
import { generateBillForReading } from '../billing/billing.service';

export const getReadings = async () => {
  return Reading.find()
    .populate('villaId', 'villaNumber')
    .populate('readerId', 'name')
    .sort({ createdAt: -1 });
};

export const getReadingsByVilla = async (villaId: string) => {
  return Reading.find({ villaId })
    .populate('readerId', 'name')
    .sort({ createdAt: -1 });
};

export const submitReading = async (
  data: {
    villaId: string;
    readerId: string;
    currentReading: number;
    previousReading: number;
    billingMonth: string;
    notes?: string;
  },
  photoFile?: Express.Multer.File
) => {
  if (Number(data.currentReading) < Number(data.previousReading)) {
    throw new ApiError(400, 'Current reading cannot be less than previous reading');
  }

  const existing = await Reading.findOne({
    villaId: data.villaId,
    billingMonth: data.billingMonth,
  });
  if (existing) {
    throw new ApiError(409, `Reading for ${data.billingMonth} already submitted for this villa`);
  }

  let photoUrl: string | undefined;
  let cloudinaryPublicId: string | undefined;

  if (photoFile) {
    const result = await uploadPhoto(photoFile.buffer, `gdv/readings/${data.villaId}`);
    photoUrl = result.secure_url;
    cloudinaryPublicId = result.public_id;
  }

  const reading = await Reading.create({ ...data, photoUrl, cloudinaryPublicId });

  // Auto-generate bill immediately after reading is saved
  await generateBillForReading(reading._id.toString());

  return reading.populate([
    { path: 'villaId', select: 'villaNumber' },
    { path: 'readerId', select: 'name' },
  ]);
};
