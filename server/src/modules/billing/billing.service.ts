import { Bill } from './bill.model';
import { Reading } from '../readings/reading.model';
import { Villa } from '../villas/villa.model';
import { User } from '../users/user.model';
import { getCurrentRate } from '../rates/rate.service';
import { sendBillEmail } from '../../services/email.service';
import { ApiError } from '../../utils/ApiError';

export const getBills = async () => {
  return Bill.find()
    .populate('villaId', 'villaNumber')
    .populate('readingId')
    .sort({ createdAt: -1 });
};

export const getBillsByVilla = async (villaId: string) => {
  return Bill.find({ villaId })
    .populate('readingId')
    .sort({ createdAt: -1 });
};

export const getBillById = async (id: string) => {
  const bill = await Bill.findById(id)
    .populate('villaId', 'villaNumber address')
    .populate('readingId');
  if (!bill) throw new ApiError(404, 'Bill not found');
  return bill;
};

export const generateBillForReading = async (readingId: string) => {
  const reading = await Reading.findById(readingId);
  if (!reading) throw new ApiError(404, 'Reading not found');

  const rate = await getCurrentRate();
  const unitsConsumed = reading.currentReading - reading.previousReading;
  const amount = unitsConsumed * rate.ratePerUnit;

  const bill = await Bill.create({
    villaId: reading.villaId,
    readingId: reading._id,
    unitsConsumed,
    ratePerUnit: rate.ratePerUnit,
    amount,
    billingMonth: reading.billingMonth,
    status: 'pending',
  });

  return bill;
};

export const sendBillEmailById = async (billId: string) => {
  const bill = await Bill.findById(billId).populate('villaId').populate('readingId');
  if (!bill) throw new ApiError(404, 'Bill not found');

  const villa = await Villa.findById(bill.villaId);
  if (!villa?.residentId) throw new ApiError(400, 'Villa has no assigned resident');

  const resident = await User.findById(villa.residentId);
  if (!resident?.email) throw new ApiError(400, 'Resident has no email address');

  // Get the reading to access the photo URL
  const reading = bill.readingId as any;

  await sendBillEmail({
    to: resident.email,
    name: resident.name,
    villaNumber: villa.villaNumber,
    billingMonth: bill.billingMonth,
    unitsConsumed: bill.unitsConsumed,
    ratePerUnit: bill.ratePerUnit,
    amount: bill.amount,
    photoUrl: reading?.photoUrl, // Include the Cloudinary photo URL
  });

  bill.status = 'sent';
  bill.emailSentAt = new Date();
  await bill.save();
};

export const markAsPaid = async (billId: string) => {
  const bill = await Bill.findByIdAndUpdate(
    billId,
    { status: 'paid' },
    { new: true }
  );
  if (!bill) throw new ApiError(404, 'Bill not found');
  return bill;
};
