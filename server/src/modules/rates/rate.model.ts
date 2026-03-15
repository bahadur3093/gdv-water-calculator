import mongoose, { Schema } from 'mongoose';
import { IRate } from '../../types';

const rateSchema = new Schema<IRate>(
  {
    ratePerUnit:   { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, required: true, default: Date.now },
    setBy:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes:         { type: String, trim: true },
  },
  { timestamps: true }
);

export const Rate = mongoose.model<IRate>('Rate', rateSchema);
