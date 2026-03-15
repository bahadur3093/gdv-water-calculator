import mongoose, { Schema } from 'mongoose';
import { IBill } from '../../types';

const billSchema = new Schema<IBill>(
  {
    villaId:       { type: Schema.Types.ObjectId, ref: 'Villa', required: true },
    readingId:     { type: Schema.Types.ObjectId, ref: 'Reading', required: true },
    unitsConsumed: { type: Number, required: true },
    ratePerUnit:   { type: Number, required: true },
    amount:        { type: Number, required: true },
    billingMonth:  { type: String, required: true },
    status:        { type: String, enum: ['pending', 'sent', 'paid'], default: 'pending' },
    emailSentAt:   { type: Date },
  },
  { timestamps: true }
);

export const Bill = mongoose.model<IBill>('Bill', billSchema);
