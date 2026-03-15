import { useState } from 'react';
import { Bill } from '@/types';
import { formatCurrency, formatMonth } from '@/utils';
import { Badge, Button, Modal } from '@/components/ui';

interface BillCardProps {
  bill: Bill;
  showVilla?: boolean;
}

const statusBadge: Record<Bill['status'], 'amber' | 'blue' | 'green'> = {
  pending: 'amber',
  sent:    'blue',
  paid:    'green',
};

export default function BillCard({ bill, showVilla = false }: BillCardProps) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const villa = typeof bill.villaId === 'object' ? bill.villaId : null;

  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setPhotoModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {showVilla && villa && (
            <p className="text-xs font-medium text-brand-600 mb-0.5">
              Villa {villa.villaNumber}
            </p>
          )}
          <p className="text-base font-semibold text-gray-900">
            {formatMonth(bill.billingMonth)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(bill.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
        <Badge variant={statusBadge[bill.status]}>
          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
        </Badge>
      </div>

      {/* Usage row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg px-3 py-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Units used</p>
          <p className="text-sm font-semibold text-gray-800">{bill.unitsConsumed}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Rate</p>
          <p className="text-sm font-semibold text-gray-800">₹{bill.ratePerUnit.toFixed(2)}</p>
        </div>
        <div className="bg-brand-50 rounded-lg px-3 py-2.5">
          <p className="text-xs text-brand-500 mb-0.5">Amount due</p>
          <p className="text-sm font-semibold text-brand-700">{formatCurrency(bill.amount)}</p>
        </div>
      </div>

      {/* Reading details */}
      {typeof bill.readingId === 'object' && bill.readingId && (
        <>
          <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
            <span>
              Prev: <span className="text-gray-600 font-medium">
                {(bill.readingId as any).previousReading}
              </span>
            </span>
            <span>→</span>
            <span>
              Current: <span className="text-gray-600 font-medium">
                {(bill.readingId as any).currentReading}
              </span>
            </span>
            {(bill.readingId as any).photoUrl && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => openPhotoModal((bill.readingId as any).photoUrl)}
                className="ml-auto text-xs"
              >
                View photo
              </Button>
            )}
          </div>

          <Modal open={photoModalOpen} onClose={closePhotoModal} title="Reading Photo" width="max-w-xl">
            {selectedPhoto ? (
              <img src={selectedPhoto} alt="Reading" className="max-h-[60vh] w-full object-contain" />
            ) : (
              <p className="text-sm text-gray-500">No image available</p>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}