import mongoose, { Schema } from 'mongoose';
import { IVilla } from '../../types';

const villaSchema = new Schema<IVilla>(
  {
    villaNumber: { type: String, required: true, unique: true, trim: true },
    residentId:  { type: Schema.Types.ObjectId, ref: 'User' },
    address:     { type: String, trim: true },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Villa = mongoose.model<IVilla>('Villa', villaSchema);
