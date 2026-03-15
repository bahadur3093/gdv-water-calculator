import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/layout/PageShell';
import { Button, Input, Modal, Badge } from '@/components/ui';
import api from '@/lib/axios';
import { Villa, User } from '@/types';

const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Villas',    to: '/admin/villas' },
  { label: 'Users',     to: '/admin/users' },
  { label: 'Rates',     to: '/admin/rates' },
  { label: 'Bills',     to: '/admin/bills' },
];

const emptyForm = { villaNumber: '', address: '', residentId: '' };

export default function ManageVillas() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Villa | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [error, setError]         = useState('');

  const { data: villas = [], isLoading } = useQuery<Villa[]>({
    queryKey: ['villas'],
    queryFn: () => api.get('/villas').then((r) => r.data.data),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data.data),
  });

  const residents = users.filter((u) => u.role === 'resident');

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => api.post('/villas', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['villas'] }); closeModal(); },
    onError:   (err: any) => setError(err.response?.data?.message || 'Failed to create villa'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof emptyForm> }) =>
      api.put(`/villas/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['villas'] }); closeModal(); },
    onError:   (err: any) => setError(err.response?.data?.message || 'Failed to update villa'),
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); };

  const openEdit = (villa: Villa) => {
    setEditing(villa);
    setForm({
      villaNumber: villa.villaNumber,
      address:     villa.address || '',
      residentId:  typeof villa.residentId === 'object'
        ? (villa.residentId as User)?._id || ''
        : villa.residentId || '',
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.villaNumber.trim()) { setError('Villa number is required'); return; }
    const payload = {
      villaNumber: form.villaNumber.trim(),
      ...(form.address    && { address:    form.address.trim() }),
      ...(form.residentId && { residentId: form.residentId }),
    };
    if (editing) updateMutation.mutate({ id: editing._id, data: payload });
    else createMutation.mutate(payload as typeof emptyForm);
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <PageShell title="GDV" navLinks={adminLinks}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Villas</h2>
          <p className="text-xs text-gray-500 mt-0.5">{villas.length} of 47 added</p>
        </div>
        <Button onClick={openAdd} size="sm">+ Add Villa</Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
      ) : villas.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-sm">No villas yet.</p>
          <button onClick={openAdd} className="mt-2 text-brand-600 text-sm hover:underline">
            Add your first villa
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {villas.map((villa) => {
              const resident = typeof villa.residentId === 'object' ? villa.residentId as User : null;
              return (
                <div key={villa._id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-gray-900">Villa {villa.villaNumber}</p>
                      {villa.address && (
                        <p className="text-xs text-gray-400 mt-0.5">{villa.address}</p>
                      )}
                      {resident ? (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 font-medium">{resident.name}</p>
                          <p className="text-xs text-gray-400 truncate">{resident.email}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-300 mt-2">Unassigned</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge variant={villa.isActive ? 'green' : 'red'}>
                        {villa.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(villa)}>Edit</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Villa</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Address</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Resident</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {villas.map((villa) => {
                  const resident = typeof villa.residentId === 'object' ? villa.residentId as User : null;
                  return (
                    <tr key={villa._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">Villa {villa.villaNumber}</td>
                      <td className="px-5 py-3.5 text-gray-500">{villa.address || <span className="text-gray-300">—</span>}</td>
                      <td className="px-5 py-3.5">
                        {resident ? (
                          <div>
                            <p className="text-gray-800 font-medium">{resident.name}</p>
                            <p className="text-gray-400 text-xs">{resident.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={villa.isActive ? 'green' : 'red'}>
                          {villa.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(villa)}>Edit</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit Villa ${editing.villaNumber}` : 'Add Villa'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Villa number *"
            placeholder="e.g. 12 or A-04"
            value={form.villaNumber}
            onChange={(e) => setForm({ ...form, villaNumber: e.target.value })}
            disabled={!!editing}
          />
          <Input
            label="Address"
            placeholder="e.g. Block A, Ground Floor"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Assign resident</label>
            <select
              value={form.residentId}
              onChange={(e) => setForm({ ...form, residentId: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">— Unassigned —</option>
              {residents.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Button>
            <Button type="submit" loading={isBusy} className="flex-1">
              {editing ? 'Save changes' : 'Add villa'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}