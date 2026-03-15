import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageShell from "@/components/layout/PageShell";
import { Button, Badge } from "@/components/ui";
import api from "@/lib/axios";
import { Bill } from "@/types";
import { formatCurrency, formatMonth } from "@/utils";

const adminLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Villas", to: "/admin/villas" },
  { label: "Users", to: "/admin/users" },
  { label: "Rates", to: "/admin/rates" },
  { label: "Bills", to: "/admin/bills" },
];

const statusBadge: Record<Bill["status"], "amber" | "blue" | "green"> = {
  pending: "amber",
  sent: "blue",
  paid: "green",
};

export default function AllBills() {
  const qc = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ["bills"],
    queryFn: () => api.get("/billing").then((r) => r.data.data),
  });

  const sendEmailMutation = useMutation({
    mutationFn: (billId: string) => api.post(`/billing/${billId}/send-email`),
    onMutate: (billId) => setSendingId(billId),
    onSuccess: (_data, billId) => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      setSentIds((prev) => new Set([...prev, billId]));
      setSendingId(null);
    },
    onError: () => setSendingId(null),
  });

  const sendAllMutation = useMutation({
    mutationFn: async (billIds: string[]) => {
      for (const id of billIds) {
        await api.post(`/billing/${id}/send-email`);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });

  // Get unique months for filter
  const months = [...new Set(bills.map((b) => b.billingMonth))]
    .sort()
    .reverse();

  const filtered = bills.filter((b) => {
    if (selectedMonth && b.billingMonth !== selectedMonth) return false;
    if (selectedStatus && b.status !== selectedStatus) return false;
    return true;
  });

  const pendingBills = filtered.filter((b) => b.status === "pending");

  // Summary stats for filtered set
  const totalAmount = filtered.reduce((sum, b) => sum + b.amount, 0);
  const pendingCount = filtered.filter((b) => b.status === "pending").length;
  const sentCount = filtered.filter((b) => b.status === "sent").length;
  const paidCount = filtered.filter((b) => b.status === "paid").length;

  const markPaidMutation = useMutation({
    mutationFn: (billId: string) => api.put(`/billing/${billId}/mark-paid`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bills"] }),
  });

  return (
    <PageShell title="GDV" navLinks={adminLinks}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bills</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} bills · {formatCurrency(totalAmount)} total
          </p>
        </div>
        {pendingBills.length > 0 && (
          <Button
            onClick={() => {
              if (
                confirm(
                  `Send emails for all ${pendingBills.length} pending bills?`,
                )
              )
                sendAllMutation.mutate(pendingBills.map((b) => b._id));
            }}
            loading={sendAllMutation.isPending}
          >
            Send all pending ({pendingBills.length})
          </Button>
        )}
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-semibold text-gray-900">
            {filtered.length}
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-xs text-amber-500 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-amber-700">
            {pendingCount}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-500 mb-1">Sent</p>
          <p className="text-2xl font-semibold text-blue-700">{sentCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-xs text-green-500 mb-1">Paid</p>
          <p className="text-2xl font-semibold text-green-700">{paidCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
        </select>
        {(selectedMonth || selectedStatus) && (
          <button
            onClick={() => {
              setSelectedMonth("");
              setSelectedStatus("");
            }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">No bills found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Villa</th>
                <th className="px-5 py-3 font-medium text-gray-500">Month</th>
                <th className="px-5 py-3 font-medium text-gray-500">Units</th>
                <th className="px-5 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500">
                  Email sent
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((bill) => {
                const villa =
                  typeof bill.villaId === "object" ? bill.villaId : null;
                const isSending = sendingId === bill._id;
                const justSent = sentIds.has(bill._id);

                return (
                  <tr
                    key={bill._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {villa ? `Villa ${villa.villaNumber}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {formatMonth(bill.billingMonth)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {bill.unitsConsumed} units
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusBadge[bill.status]}>
                        {bill.status.charAt(0).toUpperCase() +
                          bill.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {bill.emailSentAt
                        ? new Date(bill.emailSentAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {bill.status !== "paid" && (
                          <Button
                            variant={justSent ? "secondary" : "ghost"}
                            size="sm"
                            loading={isSending}
                            onClick={() => sendEmailMutation.mutate(bill._id)}
                            className={
                              justSent ? "text-green-600 border-green-200" : ""
                            }
                          >
                            {justSent
                              ? "✓ Sent"
                              : bill.status === "sent"
                                ? "Resend"
                                : "Send email"}
                          </Button>
                        )}
                        {bill.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => {
                              if (confirm(`Mark this bill as paid?`))
                                markPaidMutation.mutate(bill._id);
                            }}
                          >
                            Mark paid
                          </Button>
                        )}
                        {bill.status === "paid" && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Paid
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </PageShell>
  );
}
