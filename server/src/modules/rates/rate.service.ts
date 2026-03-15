import { Rate } from './rate.model';
import { ApiError } from '../../utils/ApiError';

export const getRates = async () => {
  return Rate.find().populate('setBy', 'name').sort({ effectiveFrom: -1 });
};

export const getCurrentRate = async () => {
  const rate = await Rate.findOne().sort({ effectiveFrom: -1 });
  if (!rate) throw new ApiError(404, 'No rate configured yet. Ask your admin to set one.');
  return rate;
};

export const createRate = async (data: {
  ratePerUnit: number;
  effectiveFrom?: Date;
  setBy: string;
  notes?: string;
}) => {
  return Rate.create(data);
};
