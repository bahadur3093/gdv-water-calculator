import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/layout/PageShell';
import { Modal, Button } from '@/components/ui';
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
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  return (
    <PageShell title="GDV" navLinks={readerLinks}>
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Reading History</h2>

        <div className="bg-white md:rounded-xl md:border md:border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
          ) : readings.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No readings submitted yet.</div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {readings.map((r) => {
                  const villa = typeof r.villaId === 'object' ? r.villaId : null;
                  const units = r.currentReading - r.previousReading;
                  return (
                    <article
                      key={r._id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {villa ? `Villa ${(villa as any).villaNumber}` : '—'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatMonth(r.billingMonth)} • {units} units
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-600">Previous</p>
                          <p>{r.previousReading}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-600">Current</p>
                          <p>{r.currentReading}</p>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-gray-200 pt-2 text-xs text-gray-500">
                        {r.photoUrl ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openPhotoModal(r.photoUrl!)}
                            className="text-xs"
                          >
                            View reading photo
                          </Button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
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
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => openPhotoModal(r.photoUrl!)}
                              className="text-xs"
                            >
                              View
                            </Button>
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
              </div>
            </>
          )}
        </div>

        <Modal open={photoModalOpen} onClose={closePhotoModal} title="Reading Photo" width="max-w-xl">
          {selectedPhoto ? (
            <img src={selectedPhoto} alt="Reading" className="max-h-[60vh] w-full object-contain" />
          ) : (
            <p className="text-sm text-gray-500">No image available</p>
          )}
        </Modal>
      </div>
    </PageShell>
  );
}