import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/layout/PageShell';
import api from '@/lib/axios';
import { Reading } from '@/types';
import { formatMonth } from '@/utils';

const readerLinks = [
  { label: 'Submit Reading', to: '/reader' },
  { label: 'History',        to: '/reader/history' },
  { label: 'All Bills',      to: '/bills/all' },
];

export default function ReadingHistory() {
  const { data: readings = [], isLoading } = useQuery<Reading[]>({
    queryKey: ['readings'],
    queryFn: () => api.get('/readings').then((r) => r.data.data),
  });

  return (
    <PageShell title="GDV" navLinks={readerLinks}>
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Reading History</h2>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
          ) : readings.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No readings submitted yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Villa</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Month</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Previous</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Current</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Units</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Photo</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {readings.map((r) => {
                  const villa = typeof r.villaId === 'object' ? r.villaId : null;
                  const units = r.currentReading - r.previousReading;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {villa ? `Villa ${(villa as any).villaNumber}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {formatMonth(r.billingMonth)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{r.previousReading}</td>
                      <td className="px-5 py-3.5 text-gray-500">{r.currentReading}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-800">{units}</span>
                        <span className="text-gray-400 text-xs ml-1">units</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {r.photoUrl ? (
                          <a
                            href={r.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:text-brand-700 text-xs underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageShell>
  );
}