import mongoose, { Schema } from 'mongoose';
import { IReading } from '../../types';

const readingSchema = new Schema<IReading>(
  {
    villaId:            { type: Schema.Types.ObjectId, ref: 'Villa', required: true },
    readerId:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentReading:     { type: Number, required: true, min: 0 },
    previousReading:    { type: Number, required: true, min: 0 },
    photoUrl:           { type: String },
    cloudinaryPublicId: { type: String },
    billingMonth:       { type: String, required: true }, // "2024-07"
    notes:              { type: String, trim: true },
  },
  { timestamps: true }
);

// One reading per villa per month
readingSchema.index({ villaId: 1, billingMonth: 1 }, { unique: true });

export const Reading = mongoose.model<IReading>('Reading', readingSchema);
