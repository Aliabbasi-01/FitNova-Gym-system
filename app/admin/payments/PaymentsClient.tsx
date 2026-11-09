
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Loader2,
  CreditCard,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Member = {
  id: string;
  full_name: string;
  email: string;
};

type Payment = {
  id: string;
  member_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  notes: string | null;
  created_at: string;
};

export default function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [status, setStatus] = useState("Paid");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [paymentResult, memberResult] = await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("members")
        .select("id, full_name, email")
        .order("full_name"),
    ]);

    if (paymentResult.error) {
      setError(paymentResult.error.message);
    } else {
      setPayments(paymentResult.data || []);
    }

    if (memberResult.error) {
      setError(memberResult.error.message);
    } else {
      setMembers(memberResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    setPaymentDate(new Date().toLocaleDateString("en-CA"));
  }, [loadData]);

  const resetForm = () => {
    setMemberId("");
    setAmount("");
    setMethod("Cash");
    setStatus("Paid");
    setNotes("");
    setPaymentDate(new Date().toLocaleDateString("en-CA"));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!memberId || !amount || Number(amount) <= 0 || !paymentDate) {
      setError("Please fill all required fields correctly.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase.from("payments").insert({
      member_id: memberId,
      amount: Number(amount),
      payment_method: method,
      payment_status: status,
      payment_date: paymentDate,
      notes: notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Payment added successfully.");
      resetForm();
      setShowForm(false);
      await loadData();
    }

    setSaving(false);
  };

  const getMemberName = (id: string) =>
    members.find((member) => member.id === id)?.full_name || "Unknown Member";

  const filteredPayments = payments.filter((payment) => {
    const memberName = getMemberName(payment.member_id).toLowerCase();
    const matchesSearch =
      memberName.includes(search.toLowerCase()) ||
      payment.payment_method.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || payment.payment_status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalPaid = payments
    .filter((payment) => payment.payment_status === "Paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const totalPending = payments
    .filter((payment) => payment.payment_status === "Pending")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const formatAmount = (value: number) =>
    `Rs. ${Number(value).toLocaleString("en-PK")}`;

  return (
    <div className="min-h-screen bg-[#090B12] p-5 text-white sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage membership fees and payment history.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#287BFF] px-4 py-2.5 text-sm font-semibold hover:bg-blue-600"
          >
            <Plus size={17} />
            Add Payment
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {error && !showForm && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#111521] p-5">
          <p className="text-sm text-gray-400">Total Payments</p>
          <h2 className="mt-2 text-2xl font-bold">{payments.length}</h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111521] p-5">
          <p className="text-sm text-gray-400">Total Received</p>
          <h2 className="mt-2 text-2xl font-bold text-green-400">
            {formatAmount(totalPaid)}
          </h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111521] p-5">
          <p className="text-sm text-gray-400">Pending Amount</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-400">
            {formatAmount(totalPending)}
          </h2>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member or payment method..."
            className="w-full rounded-lg border border-white/10 bg-[#111521] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#287BFF]"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#111521] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
        >
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111521]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-gray-400">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Method</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Loader2 className="mx-auto mb-2 animate-spin" />
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <CreditCard className="mx-auto mb-2" size={28} />
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium">
                      {getMemberName(payment.member_id)}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {payment.payment_method}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {payment.payment_date}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          payment.payment_status === "Paid"
                            ? "bg-green-500/10 text-green-400"
                            : payment.payment_status === "Pending"
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {payment.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#111521] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Add Payment</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Enter member payment details.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Select Member *
                </label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                >
                  <option value="">Choose a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} — {member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Amount (Rs.) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Payment Date *
                </label>
                <input
                  required
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                />
              </div>

              <button
                type="submit"
                disabled={saving || members.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#287BFF] py-3 text-sm font-semibold hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 size={17} className="animate-spin" />}
                {saving ? "Saving..." : "Save Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
