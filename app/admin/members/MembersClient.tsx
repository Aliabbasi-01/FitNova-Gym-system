
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  RefreshCw,
  Check,
  X,
  Clock3,
  Mail,
  Phone,
  CalendarDays,
  Loader2,
  UserRound,
  Plus,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  plan: string;
  status: string;
  created_at: string;
};

type Filter = "All" | "Pending" | "Approved" | "Rejected";
type Plan = "Basic" | "Standard" | "Premium";

const plans: { name: Plan; price: string }[] = [
  { name: "Basic", price: "3,000" },
  { name: "Standard", price: "5,000" },
  { name: "Premium", price: "8,000" },
];

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [plan, setPlan] = useState<Plan>("Basic");

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (
        roleError ||
        !roleData ||
        !["owner", "manager", "receptionist"].includes(roleData.role)
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const { data, error: membersError } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (membersError) throw membersError;

      setMembers((data || []) as Member[]);
    } catch (err) {
      console.error("Members loading error:", err);
      setError("Unable to load members. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const addMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.replace("/admin/login");
        return;
      }

      const { error: insertError } = await supabase
        .from("members")
        .insert({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          age: Number(age),
          plan,
          status: "Approved",
        });

      if (insertError) throw insertError;

      setFullName("");
      setEmail("");
      setPhone("");
      setAge("");
      setPlan("Basic");
      setShowAddForm(false);

      await loadMembers();
    } catch (err) {
      console.error("Add member error:", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not add member. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    memberId: string,
    status: "Approved" | "Rejected"
  ) => {
    setUpdating(memberId);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("members")
        .update({ status })
        .eq("id", memberId);

      if (updateError) throw updateError;

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId ? { ...member, status } : member
        )
      );
    } catch (err) {
      console.error("Member update error:", err);
      setError("Could not update member status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const counts = useMemo(
    () => ({
      All: members.length,
      Pending: members.filter((m) => m.status === "Pending").length,
      Approved: members.filter((m) => m.status === "Approved").length,
      Rejected: members.filter((m) => m.status === "Rejected").length,
    }),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesFilter = filter === "All" || member.status === filter;

      const matchesSearch =
        !query ||
        member.full_name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.phone.includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [members, search, filter]);

  const statusStyle = (status: string) => {
    if (status === "Approved") {
      return "bg-green-500/10 text-green-400 border-green-500/20";
    }

    if (status === "Rejected") {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  };

  return (
    <main className="min-h-screen bg-[#090B12] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#287BFF]">
              FitNova Administration
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">Members</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage membership applications and members.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadMembers}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#141824] px-4 py-2.5 text-sm font-medium transition hover:border-[#287BFF] disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => {
                setFormError("");
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#287BFF] px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-600"
            >
              <Plus size={17} />
              Add Member
            </button>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4">
            <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#111520] p-5 shadow-2xl sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[#287BFF]">
                    <UserPlus size={19} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      New Membership
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">Add New Member</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Add a gym member directly from admin.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                  className="rounded-lg bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={addMember} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Full Name
                  </label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter member name"
                    className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03XX XXXXXXX"
                      className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Age
                    </label>
                    <input
                      required
                      type="number"
                      min="10"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter age"
                      className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Membership Plan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {plans.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setPlan(item.name)}
                        className={`rounded-lg border p-3 text-left transition ${
                          plan === item.name
                            ? "border-[#287BFF] bg-[#287BFF]/10"
                            : "border-white/10 bg-[#090B12] hover:border-white/30"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          {item.name}
                        </span>
                        <span className="mt-1 block text-xs text-gray-400">
                          Rs. {item.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-xs text-green-400">
                  This member will be added with Approved status.
                </div>

                {formError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    disabled={saving}
                    className="flex-1 rounded-lg border border-white/10 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#287BFF] py-3 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus size={17} />
                        Add Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(
            [
              ["All Members", counts.All, Users, "#287BFF"],
              ["Pending", counts.Pending, Clock3, "#FF7438"],
              ["Approved", counts.Approved, Check, "#22C55E"],
              ["Rejected", counts.Rejected, X, "#EF4444"],
            ] as const
          ).map(([label, count, Icon, color]) => (
            <div
              key={label}
              className="rounded-xl border border-white/[0.07] bg-[#111520] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="mt-3 text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>

        {/* Members Section */}
        <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#111520]">
          <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="font-semibold">Member Applications</h2>

            <div className="relative w-full lg:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or phone..."
                className="w-full rounded-lg border border-white/10 bg-[#090B12] py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-[#287BFF]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto border-b border-white/[0.07] px-4 py-3">
            {(["All", "Pending", "Approved", "Rejected"] as Filter[]).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    filter === item
                      ? "bg-[#287BFF] text-white"
                      : "bg-[#1A2030] text-gray-400 hover:text-white"
                  }`}
                >
                  {item} ({counts[item]})
                </button>
              )
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="m-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading / Members */}
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin text-[#287BFF]" />
              <p className="text-sm">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 rounded-full bg-[#1A2030] p-4">
                <Users size={25} className="text-gray-400" />
              </div>
              <p className="font-semibold">No members found</p>
              <p className="mt-1 text-sm text-gray-500">
                {search
                  ? "Try another search term."
                  : "Membership applications will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 p-4 transition hover:bg-white/[0.02] lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#287BFF]/10 text-[#287BFF]">
                      <UserRound size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        {member.full_name}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail size={13} />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={13} />
                          {member.phone}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-[#287BFF]/10 px-2 py-1 text-[#6EA5FF]">
                          {member.plan}
                        </span>
                        <span className="text-gray-500">
                          Age: {member.age}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <CalendarDays size={12} />
                          {new Date(member.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle(member.status)}`}
                    >
                      {member.status}
                    </span>

                    {member.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(member.id, "Approved")}
                          disabled={updating === member.id}
                          className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                        >
                          {updating === member.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus(member.id, "Rejected")}
                          disabled={updating === member.id}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    {member.status === "Rejected" && (
                      <button
                        onClick={() => updateStatus(member.id, "Approved")}
                        disabled={updating === member.id}
                        className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredMembers.length > 0 && (
            <div className="border-t border-white/[0.07] px-4 py-3 text-xs text-gray-500">
              Showing {filteredMembers.length} of {members.length} members
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
