import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageShell from "@/components/layout/PageShell";
import { Button, Input, Modal, Badge } from "@/components/ui";
import api from "@/lib/axios";
import { User, Villa, UserRole } from "@/types";

const adminLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Villas",    to: "/admin/villas" },
  { label: "Users",     to: "/admin/users" },
  { label: "Rates",     to: "/admin/rates" },
  { label: "Bills",     to: "/admin/bills" },
];

const emptyForm = {
  name: "", email: "", password: "",
  role: "resident" as UserRole,
  villaId: "", phone: "",
};

const roleBadge: Record<UserRole, "purple" | "blue" | "green"> = {
  admin: "purple", reader: "blue", resident: "green",
};

export default function ManageUsers() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<User | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [error, setError]         = useState("");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then((r) => r.data.data),
  });

  const { data: villas = [] } = useQuery<Villa[]>({
    queryKey: ["villas"],
    queryFn: () => api.get("/villas").then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => api.post("/users", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); closeModal(); },
    onError:   (err: any) => setError(err.response?.data?.message || "Failed to create user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof emptyForm> }) =>
      api.put(`/users/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); closeModal(); },
    onError:   (err: any) => setError(err.response?.data?.message || "Failed to update user"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name, email: user.email, password: "",
      role: user.role, villaId: user.villaId || "", phone: user.phone || "",
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); setError(""); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())  { setError("Name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!editing && form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (editing) {
      updateMutation.mutate({ id: editing._id, data: {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        ...(form.villaId && { villaId: form.villaId }),
      }});
    } else {
      createMutation.mutate({
        name: form.name.trim(), email: form.email.trim(),
        password: form.password, role: form.role,
        ...(form.phone   && { phone:   form.phone.trim() }),
        ...(form.villaId && { villaId: form.villaId }),
      } as typeof emptyForm);
    }
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;
  const counts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <PageShell title="GDV" navLinks={adminLinks}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {counts.admin || 0} admin · {counts.reader || 0} reader · {counts.resident || 0} residents
          </p>
        </div>
        <Button onClick={openAdd} size="sm">+ Add User</Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-sm">No users yet.</p>
          <button onClick={openAdd} className="mt-2 text-brand-600 text-sm hover:underline">Add your first user</button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                    {user.villa && (
                      <p className="text-xs text-brand-600 mt-1 font-medium">Villa {user.villa.villaNumber}</p>
                    )}
                    {user.phone && (
                      <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant={roleBadge[user.role]}>
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>Edit</Button>
                      <Button variant="ghost" size="sm"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => { if (confirm(`Deactivate ${user.name}?`)) deactivateMutation.mutate(user._id); }}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Role</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Villa</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{user.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={roleBadge[user.role]}><span className="capitalize">{user.role}</span></Badge>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {user.villa ? (
                        <div>
                          <p className="text-gray-800 font-medium">Villa {user.villa.villaNumber}</p>
                          {user.villa.address && <p className="text-gray-400 text-xs">{user.villa.address}</p>}
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {user.role === "admin" || user.role === "reader" ? (
                        <Badge variant={roleBadge[user.role]}><span className="capitalize">{user.role}</span></Badge>
                      ) : (
                        <Badge variant={user.isActive ? "green" : "red"}>
                          <span className="capitalize">{user.isActive ? "Active" : "Inactive"}</span>
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>Edit</Button>
                        <Button variant="ghost" size="sm"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => { if (confirm(`Deactivate ${user.name}?`)) deactivateMutation.mutate(user._id); }}>
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Edit ${editing.name}` : "Add User"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name *" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email *" type="email" placeholder="e.g. rajesh@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editing} />
          {!editing && <Input label="Password *" type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
          <Input label="Phone" type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          {!editing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="resident">Resident</option>
                <option value="reader">Reader</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {(form.role === "resident" || editing?.role === "resident") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Assign to villa</label>
              <select value={form.villaId} onChange={(e) => setForm({ ...form, villaId: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="">— No villa —</option>
                {villas.map((v) => (
                  <option key={v._id} value={v._id}>Villa {v.villaNumber}{v.address ? ` — ${v.address}` : ""}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Button>
            <Button type="submit" loading={isBusy} className="flex-1">{editing ? "Save changes" : "Add user"}</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}