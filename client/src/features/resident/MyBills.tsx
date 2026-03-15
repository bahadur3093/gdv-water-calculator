import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/layout/PageShell';
import BillCard from './BillCard';
import api from '@/lib/axios';
import { Bill } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils';

const residentLinks = [
  { label: 'My Bills',      to: '/bills' },
  { label: 'All Residents', to: '/bills/all' },
];

export default function MyBills() {
  const { user } = useAuth();

  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ['bills', 'my'],
    queryFn: async () => {
      // Get the villa assigned to this resident
      const villasRes = await api.get('/villas');
      const villas = villasRes.data.data;
      const myVilla = villas.find((v: any) => {
        const rid = typeof v.residentId === 'object'
          ? v.residentId?._id
          : v.residentId;
        return rid === user?._id || rid === (user as any)?.id;
      });
      if (!myVilla) return [];
      const billsRes = await api.get(`/billing/villa/${myVilla._id}`);
      return billsRes.data.data;
    },
    enabled: !!user,
  });

  // Summary stats
  const totalDue = bills
    .filter((b) => b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPaid = bills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <PageShell title="GDV" navLinks={residentLinks}>
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Bills</h2>

        {/* Summary cards */}
        {bills.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">Total bills</p>
              <p className="text-2xl font-semibold text-gray-900">{bills.length}</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <p className="text-xs text-amber-500 mb-1">Outstanding</p>
              <p className="text-2xl font-semibold text-amber-700">{formatCurrency(totalDue)}</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <p className="text-xs text-green-500 mb-1">Total paid</p>
              <p className="text-2xl font-semibold text-green-700">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        )}

        {/* Bills list */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading your bills…</div>
        ) : bills.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm">No bills yet.</p>
            <p className="text-gray-300 text-xs mt-1">
              Bills appear here once your meter is read each month.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bills.map((bill) => (
              <BillCard key={bill._id} bill={bill} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}