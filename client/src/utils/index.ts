import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Format number as Indian Rupees */
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

/** Format "2024-07" → "July 2024" */
export const formatMonth = (month: string) => {
  const [year, m] = month.split('-');
  return new Date(Number(year), Number(m) - 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

/** Get current billing month as "YYYY-MM" */
export const currentBillingMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
