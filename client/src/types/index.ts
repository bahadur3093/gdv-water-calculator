export type UserRole = 'admin' | 'reader' | 'resident';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  villaId?: string;
  phone?: string;
  villa?: {
    _id: string;
    villaNumber: string;
    address?: string;
  } | null;
}

export interface Villa {
  _id: string;
  villaNumber: string;
  residentId?: User;
  address?: string;
  isActive: boolean;
}

export interface Reading {
  _id: string;
  villaId: Villa | string;
  readerId: User | string;
  currentReading: number;
  previousReading: number;
  photoUrl?: string;
  billingMonth: string;
  notes?: string;
  createdAt: string;
}

export interface Bill {
  _id: string;
  villaId: Villa;
  readingId: Reading;
  unitsConsumed: number;
  ratePerUnit: number;
  amount: number;
  billingMonth: string;
  status: 'pending' | 'sent' | 'paid';
  emailSentAt?: string;
  createdAt: string;
}

export interface Rate {
  _id: string;
  ratePerUnit: number;
  effectiveFrom: string;
  setBy: User | string;
  notes?: string;
}
