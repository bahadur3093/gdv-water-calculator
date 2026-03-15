import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import api from '@/lib/axios';
import { Bill, Villa, User, Rate } from '@/types';
import { formatCurrency, formatMonth } from '@/utils';

const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Villas',    to: '/admin/villas' },
  { label: 'Users',     to: '/admin/users' },
  { label: 'Rates',     to: '/admin/rates' },
  { label: 'Bills',     to: '/admin/bills' },
];

export default function AdminDashboard() {
  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: () => api.get('/billing').then((r) => r.data.data),
  });
  const { data: villas = [] } = useQuery<Villa[]>({
    queryKey: ['villas'],
    queryFn: () => api.get('/villas').then((r) => r.data.data),
  });
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data.data),
  });
  const { data: currentRate } = useQuery<Rate>({
    queryKey: ['rates', 'current'],
    queryFn: () => api.get('/rates/current').then((r) => r.data.data),
    retry: false,
  });

  const totalRevenue  = bills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const outstanding   = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const pendingCount  = bills.filter((b) => b.status === 'pending').length;
  const residentCount = users.filter((u) => u.role === 'resident').length;
  const assignedVillas   = villas.filter((v) => v.residentId).length;
  const unassignedVillas = villas.filter((v) => !v.residentId).length;

  const monthlyData = bills.reduce((acc, bill) => {
    if (!acc[bill.billingMonth]) acc[bill.billingMonth] = { total: 0, paid: 0, count: 0 };
    acc[bill.billingMonth].total += bill.amount;
    acc[bill.billingMonth].count += 1;
    if (bill.status === 'paid') acc[bill.billingMonth].paid += bill.amount;
    return acc;
  }, {} as Record<string, { total: number; paid: number; count: number }>);

  const months    = Object.keys(monthlyData).sort().slice(-6);
  const maxAmount = Math.max(...months.map((m) => monthlyData[m].total), 1);

  const recentBills = [...bills]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusColor: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    sent:    'text-blue-600 bg-blue-50 border-blue-200',
    paid:    'text-green-600 bg-green-50 border-green-200',
  };

  return (
    <PageShell title="GDV — Admin" navLinks={adminLinks}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h2>

      {/* Stats — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Revenue</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">from paid bills</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-xs text-amber-500 mb-1">Outstanding</p>
          <p className="text-xl font-semibold text-amber-700">{formatCurrency(outstanding)}</p>
          <p className="text-xs text-amber-400 mt-1">{pendingCount} pending</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Villas</p>
          <p className="text-xl font-semibold text-gray-900">{villas.length}</p>
          <p className="text-xs text-gray-400 mt-1">{assignedVillas} assigned · {unassignedVillas} free</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Residents</p>
          <p className="text-xl font-semibold text-gray-900">{residentCount}</p>
          <p className="text-xs text-gray-400 mt-1">
            {currentRate ? `₹${currentRate.ratePerUnit}/unit` : 'No rate set'}
          </p>
        </div>
      </div>

      {/* Chart + status — stacked on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly billing</h3>
          {months.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-gray-300">No data yet</div>
          ) : (
            <>
              <div className="flex items-end gap-2 h-32">
                {months.map((month) => {
                  const d      = monthlyData[month];
                  const totalH = Math.round((d.total / maxAmount) * 100);
                  const paidH  = Math.round((d.paid  / maxAmount) * 100);
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col justify-end h-24 relative">
                        <div className="w-full bg-brand-100 rounded-t-md absolute bottom-0" style={{ height: `${totalH}%` }} />
                        <div className="w-full bg-brand-600 rounded-t-md absolute bottom-0" style={{ height: `${paidH}%` }} />
                      </div>
                      <p className="text-xs text-gray-400">{month.split('-')[1]}/{month.split('-')[0].slice(2)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-brand-600" /><span className="text-xs text-gray-500">Paid</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-brand-100" /><span className="text-xs text-gray-500">Total billed</span></div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Bill status</h3>
          {bills.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-gray-300">No bills yet</div>
          ) : (
            <div className="flex flex-col gap-3">
              {(['pending', 'sent', 'paid'] as const).map((status) => {
                const count = bills.filter((b) => b.status === status).length;
                const pct   = bills.length > 0 ? Math.round((count / bills.length) * 100) : 0;
                const colors: Record<string, string> = {
                  pending: 'bg-amber-400', sent: 'bg-blue-400', paid: 'bg-green-400',
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 capitalize">{status}</span>
                      <span className="text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[status]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total billed</span>
                  <span className="font-medium text-gray-700">{formatCurrency(bills.reduce((s, b) => s + b.amount, 0))}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Collected</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent bills */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent bills</h3>
          <Link to="/admin/bills" className="text-xs text-brand-600 hover:underline">View all</Link>
        </div>
        {recentBills.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-300">No bills yet</div>
        ) : (
          <>
            {/* Mobile list */}
            <div className="divide-y divide-gray-50 md:hidden">
              {recentBills.map((bill) => {
                const villa = typeof bill.villaId === 'object' ? bill.villaId : null;
                return (
                  <div key={bill._id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{villa ? `Villa ${villa.villaNumber}` : '—'}</p>
                      <p className="text-xs text-gray-400">{formatMonth(bill.billingMonth)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md border capitalize ${statusColor[bill.status]}`}>{bill.status}</span>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(bill.amount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-100">
                  <th className="px-5 py-3 font-medium text-gray-500">Villa</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Month</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Amount</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBills.map((bill) => {
                  const villa = typeof bill.villaId === 'object' ? bill.villaId : null;
                  return (
                    <tr key={bill._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{villa ? `Villa ${villa.villaNumber}` : '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{formatMonth(bill.billingMonth)}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{formatCurrency(bill.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md border capitalize ${statusColor[bill.status]}`}>{bill.status}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </PageShell>
  );
}
