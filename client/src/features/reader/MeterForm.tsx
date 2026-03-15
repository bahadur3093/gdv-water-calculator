import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/layout/PageShell';
import { Button, Input } from '@/components/ui';
import api from '@/lib/axios';
import { Villa, Rate } from '@/types';
import { currentBillingMonth, formatCurrency } from '@/utils';

const readerLinks = [
  { label: 'Submit Reading', to: '/reader' },
  { label: 'History',        to: '/reader/history' },
];

const emptyForm = {
  villaId:         '',
  previousReading: '',
  currentReading:  '',
  billingMonth:    currentBillingMonth(),
  notes:           '',
};

export default function MeterForm() {
  const qc = useQueryClient();
  const [form, setForm]         = useState(emptyForm);
  const [photo, setPhoto]       = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const { data: villas = [] } = useQuery<Villa[]>({
    queryKey: ['villas'],
    queryFn: () => api.get('/villas').then((r) => r.data.data),
  });

  const { data: currentRate } = useQuery<Rate>({
    queryKey: ['rates', 'current'],
    queryFn: () => api.get('/rates/current').then((r) => r.data.data),
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/readings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['readings'] });
      qc.invalidateQueries({ queryKey: ['bills'] });
      const bill = res.data?.data;
      setSuccess(
        `Reading saved! Bill generated successfully.`
      );
      setForm(emptyForm);
      setPhoto(null);
      setPreview(null);
      setError('');
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Failed to submit reading'),
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.villaId)         { setError('Please select a villa'); return; }
    if (!form.previousReading) { setError('Previous reading is required'); return; }
    if (!form.currentReading)  { setError('Current reading is required'); return; }
    if (!form.billingMonth)    { setError('Billing month is required'); return; }

    const prev = parseFloat(form.previousReading);
    const curr = parseFloat(form.currentReading);

    if (isNaN(prev) || isNaN(curr)) { setError('Readings must be numbers'); return; }
    if (curr < prev) { setError('Current reading cannot be less than previous reading'); return; }

    const fd = new FormData();
    fd.append('villaId',         form.villaId);
    fd.append('previousReading', String(prev));
    fd.append('currentReading',  String(curr));
    fd.append('billingMonth',    form.billingMonth);
    if (form.notes.trim()) fd.append('notes', form.notes.trim());
    if (photo) fd.append('photo', photo);

    submitMutation.mutate(fd);
  };

  // Live bill preview
  const units = (() => {
    const p = parseFloat(form.previousReading);
    const c = parseFloat(form.currentReading);
    if (isNaN(p) || isNaN(c) || c < p) return null;
    return c - p;
  })();

  const estimatedBill = units !== null && currentRate
    ? units * currentRate.ratePerUnit
    : null;

  const selectedVilla = villas.find((v) => v._id === form.villaId);

  return (
    <PageShell title="GDV" navLinks={readerLinks}>
      <div className="max-w-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Meter Reading</h2>

        {!currentRate && (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            No rate is set yet. Ask your admin to set a rate before submitting readings.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Villa selector */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Villa *</label>
            <select
              value={form.villaId}
              onChange={(e) => setForm({ ...form, villaId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">— Select villa —</option>
              {villas.map((v) => {
                const resident = typeof v.residentId === 'object'
                  ? (v.residentId as any)?.name
                  : null;
                return (
                  <option key={v._id} value={v._id}>
                    Villa {v.villaNumber}{resident ? ` — ${resident}` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Billing month */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Billing month *</label>
            <input
              type="month"
              value={form.billingMonth}
              onChange={(e) => setForm({ ...form, billingMonth: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          {/* Readings row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Previous reading *"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1240"
              value={form.previousReading}
              onChange={(e) => setForm({ ...form, previousReading: e.target.value })}
            />
            <Input
              label="Current reading *"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1380"
              value={form.currentReading}
              onChange={(e) => setForm({ ...form, currentReading: e.target.value })}
            />
          </div>

          {/* Live bill preview */}
          {units !== null && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${
              estimatedBill !== null
                ? 'bg-brand-50 border-brand-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Units consumed</span>
                <span className="font-semibold text-gray-900">{units} units</span>
              </div>
              {estimatedBill !== null && (
                <>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-600">
                      Rate (₹{currentRate!.ratePerUnit.toFixed(2)}/unit)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(estimatedBill)}
                    </span>
                  </div>
                  <div className="border-t border-brand-200 mt-2 pt-2 flex justify-between">
                    <span className="font-medium text-gray-700">Estimated bill</span>
                    <span className="font-bold text-brand-700 text-base">
                      {formatCurrency(estimatedBill)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Photo upload */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Meter photo <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-3 items-start">
              <label className="cursor-pointer flex items-center gap-2 border border-gray-300
                                rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50
                                transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                {photo ? photo.name : 'Choose photo'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              {photo && (
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPreview(null); }}
                  className="text-xs text-red-400 hover:text-red-600 mt-2"
                >
                  Remove
                </button>
              )}
            </div>
            {preview && (
              <img
                src={preview}
                alt="Meter preview"
                className="mt-2 w-40 h-28 object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Meter was partially obstructed"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

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

          <Button
            type="submit"
            loading={submitMutation.isPending}
            className="w-full"
          >
            Submit reading & generate bill
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
