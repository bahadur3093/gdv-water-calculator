import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/layout/PageShell';
import { Button, Input } from '@/components/ui';
import api from '@/lib/axios';
import { Rate } from '@/types';
import { formatMonth } from '@/utils';

const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Villas',    to: '/admin/villas' },
  { label: 'Users',     to: '/admin/users' },
  { label: 'Rates',     to: '/admin/rates' },
  { label: 'Bills',     to: '/admin/bills' },
];

export default function SetRate() {
  const qc = useQueryClient();
  const [rate, setRate]   = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: currentRate, isLoading: loadingCurrent } = useQuery<Rate>({
    queryKey: ['rates', 'current'],
    queryFn: () => api.get('/rates/current').then((r) => r.data.data),
    retry: false, // don't retry if no rate exists yet
  });

  const { data: allRates = [], isLoading: loadingAll } = useQuery<Rate[]>({
    queryKey: ['rates'],
    queryFn: () => api.get('/rates').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { ratePerUnit: number; notes?: string }) =>
      api.post('/rates', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rates'] });
      setRate('');
      setNotes('');
      setError('');
      setSuccess('New rate saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Failed to save rate'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const parsed = parseFloat(rate);
    if (!rate || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid rate greater than 0');
      return;
    }
    createMutation.mutate({ ratePerUnit: parsed, notes: notes.trim() || undefined });
  };

  return (
    <PageShell title="GDV" navLinks={adminLinks}>
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Water Rate</h2>

        {/* Current rate card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Current rate</p>
          {loadingCurrent ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : currentRate ? (
            <div className="flex items-end gap-4">
              <div>
                <p className="text-4xl font-semibold text-gray-900">
                  ₹{currentRate.ratePerUnit.toFixed(2)}
                  <span className="text-base font-normal text-gray-400 ml-1">/ unit</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Effective from{' '}
                  {new Date(currentRate.effectiveFrom).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {typeof currentRate.setBy === 'object' && (currentRate.setBy as any)?.name
                    ? ` · Set by ${(currentRate.setBy as any).name}`
                    : ''}
                </p>
                {currentRate.notes && (
                  <p className="text-sm text-gray-400 mt-0.5 italic">"{currentRate.notes}"</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-amber-600 text-sm">
              No rate set yet — bills cannot be generated until you set one.
            </p>
          )}
        </div>

        {/* Set new rate form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {currentRate ? 'Update rate' : 'Set initial rate'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Rate per unit (₹) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 12.50"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-400 pb-2">per unit</p>
            </div>

            <Input
              label="Notes (optional)"
              placeholder="e.g. Revised as per municipal update"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={createMutation.isPending}>
                Save rate
              </Button>
              {currentRate && (
                <p className="text-xs text-gray-400">
                  This will apply to all new bills going forward. Existing bills are unaffected.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Rate history */}
        {allRates.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Rate history</h3>
            </div>
            {loadingAll ? (
              <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="px-5 py-3 font-medium text-gray-500">Rate</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Effective from</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Set by</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allRates.map((r, i) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        ₹{r.ratePerUnit.toFixed(2)}
                        {i === 0 && (
                          <span className="ml-2 text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-md">
                            current
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(r.effectiveFrom).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {typeof r.setBy === 'object'
                          ? (r.setBy as any)?.name || '—'
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 italic">
                        {r.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}