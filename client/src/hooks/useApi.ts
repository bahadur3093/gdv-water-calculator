import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Bill, Villa, Reading, Rate, User } from '@/types';

// ── Villas ────────────────────────────────────────────────────
export const useVillas = () =>
  useQuery<Villa[]>({
    queryKey: ['villas'],
    queryFn: () => api.get('/villas').then((r) => r.data.data),
  });

// ── Bills ─────────────────────────────────────────────────────
export const useAllBills = () =>
  useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: () => api.get('/billing').then((r) => r.data.data),
  });

export const useBillsByVilla = (villaId: string) =>
  useQuery<Bill[]>({
    queryKey: ['bills', villaId],
    queryFn: () => api.get(`/billing/villa/${villaId}`).then((r) => r.data.data),
    enabled: !!villaId,
  });

// ── Readings ──────────────────────────────────────────────────
export const useReadings = () =>
  useQuery<Reading[]>({
    queryKey: ['readings'],
    queryFn: () => api.get('/readings').then((r) => r.data.data),
  });

export const useReadingsByVilla = (villaId: string) =>
  useQuery<Reading[]>({
    queryKey: ['readings', villaId],
    queryFn: () => api.get(`/readings/villa/${villaId}`).then((r) => r.data.data),
    enabled: !!villaId,
  });

// ── Rates ─────────────────────────────────────────────────────
export const useCurrentRate = () =>
  useQuery<Rate>({
    queryKey: ['rates', 'current'],
    queryFn: () => api.get('/rates/current').then((r) => r.data.data),
  });

export const useRates = () =>
  useQuery<Rate[]>({
    queryKey: ['rates'],
    queryFn: () => api.get('/rates').then((r) => r.data.data),
  });

// ── Users ─────────────────────────────────────────────────────
export const useUsers = () =>
  useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data.data),
  });

// ── Mutations ─────────────────────────────────────────────────
export const useSubmitReading = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/readings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['readings'] });
      qc.invalidateQueries({ queryKey: ['bills'] });
    },
  });
};

export const useCreateRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { ratePerUnit: number; notes?: string }) =>
      api.post('/rates', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rates'] }),
  });
};

export const useCreateVilla = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { villaNumber: string; address?: string; residentId?: string }) =>
      api.post('/villas', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['villas'] }),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      role: string;
      villaId?: string;
      phone?: string;
    }) => api.post('/users', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useSendBillEmail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => api.post(`/billing/${billId}/send-email`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
};
