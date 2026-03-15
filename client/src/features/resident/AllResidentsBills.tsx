import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/layout/PageShell';
import BillCard from './BillCard';
import api from '@/lib/axios';
import { Bill } from '@/types';
import { formatCurrency, formatMonth } from '@/utils';

const residentLinks = [
  { label: 'My Bills',      to: '/bills' },
  { label: 'All Residents', to: '/bills/all' },
];

export default function AllResidentsBills() {
  const [selectedMonth, setSelectedMonth] = useState('');

  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ['bills', 'all'],
    queryFn: () => api.get('/billing').then((r) => r.data.data),
  });

  // Get unique months for filter
  const months = [...new Set(bills.map((b) => b.billingMonth))].sort().reverse();

  const filtered = selectedMonth
    ? bills.filter((b) => b.billingMonth === selectedMonth)
    : bills;

  // Group by villa
  const grouped = filtered.reduce((acc, bill) => {
    const villa = typeof bill.villaId === 'object' ? bill.villaId : null;
    const key = villa?.villaNumber || bill.villaId._id as string;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bill);
    return acc;
  }, {} as Record<string, Bill[]>);

  const totalAmount = filtered.reduce((sum, b) => sum + b.amount, 0);

  return (
    <PageShell title="GDV" navLinks={residentLinks}>
      <div className="max-w-3xl">

        {/* Header + filter */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Residents</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtered.length} bills · {formatCurrency(totalAmount)} total
            </p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm">No bills found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([villaNumber, villaBills]) => (
                <div key={villaNumber}>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    Villa {villaNumber}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {villaBills.map((bill) => (
                      <BillCard key={bill._id} bill={bill} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}