import { Types } from 'mongoose';

export type UserRole = 'admin' | 'reader' | 'resident';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  villaId?: Types.ObjectId;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVilla {
  _id: Types.ObjectId;
  villaNumber: string;
  residentId?: Types.ObjectId;
  address?: string;
  isActive: boolean;
}

export interface IReading {
  _id: Types.ObjectId;
  villaId: Types.ObjectId;
  readerId: Types.ObjectId;
  currentReading: number;
  previousReading: number;
  photoUrl?: string;
  cloudinaryPublicId?: string;
  billingMonth: string; // "2024-07"
  notes?: string;
  createdAt: Date;
}

export interface IBill {
  _id: Types.ObjectId;
  villaId: Types.ObjectId;
  readingId: Types.ObjectId;
  unitsConsumed: number;
  ratePerUnit: number;
  amount: number;
  billingMonth: string;
  status: 'pending' | 'sent' | 'paid';
  emailSentAt?: Date;
  createdAt: Date;
}

export interface IRate {
  _id: Types.ObjectId;
  ratePerUnit: number;
  effectiveFrom: Date;
  setBy: Types.ObjectId;
  notes?: string;
}

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        villaId?: string;
      };
    }
  }
}
