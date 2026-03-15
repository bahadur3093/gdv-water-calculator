import { Villa } from './villa.model';
import { ApiError } from '../../utils/ApiError';

export const getVillas = async () => {
  return Villa.find({ isActive: true })
    .populate('residentId', 'name email phone')
    .sort('villaNumber');
};

export const createVilla = async (data: {
  villaNumber: string;
  residentId?: string;
  address?: string;
}) => {
  const exists = await Villa.findOne({ villaNumber: data.villaNumber });
  if (exists) throw new ApiError(409, `Villa ${data.villaNumber} already exists`);
  return Villa.create(data);
};

export const updateVilla = async (
  id: string,
  data: Partial<{ residentId: string; address: string; isActive: boolean }>
) => {
  const villa = await Villa.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!villa) throw new ApiError(404, 'Villa not found');
  return villa;
};
