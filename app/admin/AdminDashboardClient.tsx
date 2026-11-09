
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Users,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  created_at: string;
};

export default function AdminDashboardClient() {
  const router = useRouter();

  const [name, setName] = useState("Owner");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    basic: 0,
    standard: 0,
    premium: 0,
  });

  const [recentMembers, setRecentMembers] = useState<Member[]>([]);

  const loadDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/admin/login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
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

      setName(user.user_metadata?.full_name || "Owner");
      setEmail(user.email || "");
      setRole(roleData.role);

      const [
        totalResult,
        pendingResult,
        approvedResult,
        rejectedResult,
        basicResult,
        standardResult,
        premiumResult,
        recentResult,
      ] = await Promise.all([
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "Pending"),
        supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "Approved"),
        supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "Rejected"),
        supabase.from("members").select("id", { count: "exact", head: true }).eq("plan", "Basic"),
        supabase.from("members").select("id", { count: "exact", head: true }).eq("plan", "Standard"),
        supabase.from("members").select("id", { count: "exact", head: true }).eq("plan", "Premium"),
        supabase
          .from("members")
          .select("id, full_name, email, phone, plan, status, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      const results = [
        totalResult,
        pendingResult,
        approvedResult,
        rejectedResult,
        basicResult,
        standardResult,
        premiumResult,
        recentResult,
      ];

      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;

      setStats({
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        approved: approvedResult.count || 0,
        rejected: rejectedResult.count || 0,
        basic: basicResult.count || 0,
        standard: standardResult.count || 0,
        premium: premiumResult.count || 0,
      });

      setRecentMembers((recentResult.data || []) as Member[]);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const statCards = [
    {
      title: "Total Members",
      value: stats.total,
      icon: Users,
      color: "#287BFF",
      description: "All registered members",
    },
    {
      title: "Pending Applications",
      value: stats.pending,
      icon: Clock3,
      color: "#FF7438",
      description: "Waiting for approval",
    },
    {
      title: "Approved Members",
      value: stats.approved,
      icon: CheckCircle2,
      color: "#22C55E",
      description: "Approved memberships",
    },
    {
      title: "Rejected Applications",
      value: stats.rejected,
      icon: XCircle,
      color: "#EF4444",
      description: "Rejected applications",
    },
  ];

  const plans = [
    { name: "Basic", value: stats.basic, color: "#287BFF" },
    { name: "Standard", value: stats.standard, color: "#FF7438" },
    { name: "Premium", value: stats.premium, color: "#A78BFA" },
  ];

  return (
    <div className="min-h-screen bg-[#090B12] text-white">
      <header className="flex min-h-20 items-center justify-between gap-3 border-b border-white/10 px-5 sm:px-8">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-xs text-gray-500">Gym overview</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(false)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:border-[#287BFF] disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5"
          >
            View Website <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

      <div className="space-y-8 p-5 sm:p-8">
        <div>
          <p className="text-sm text-gray-400">Welcome back,</p>
          <h2 className="mt-1 text-2xl font-bold">
            {name} <span className="text-[#287BFF]">!</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage your gym from one place.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
            <button
              onClick={() => loadDashboard()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Membership Overview</h2>
            {loading && (
              <Loader2 size={17} className="animate-spin text-[#287BFF]" />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-white/10 bg-[#121824] p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm text-gray-400">{stat.title}</span>
                    <div className="rounded-lg bg-white/5 p-2">
                      <Icon size={19} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">
                    {loading ? "—" : stat.value.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121824]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h3 className="font-semibold">Recent Registrations</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Latest membership applications
                </p>
              </div>
              <Link
                href="/admin/members"
                className="flex items-center gap-1 text-xs font-semibold text-[#5B9AFF] hover:text-white"
              >
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 className="animate-spin text-[#287BFF]" />
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <Users size={30} className="mb-3 text-gray-600" />
                <p className="text-sm text-gray-400">No registrations yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#287BFF]/10 text-sm font-bold text-[#5B9AFF]">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {member.full_name}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {member.plan} · {formatDate(member.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        member.status === "Approved"
                          ? "bg-green-500/10 text-green-400"
                          : member.status === "Rejected"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-orange-500/10 text-orange-400"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#121824] p-5">
            <h3 className="font-semibold">Membership Plans</h3>
            <p className="mt-1 text-xs text-gray-500">
              Registered members by plan
            </p>

            <div className="mt-7 space-y-6">
              {plans.map((plan) => {
                const percentage =
                  stats.total > 0 ? (plan.value / stats.total) * 100 : 0;

                return (
                  <div key={plan.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-300">{plan.name}</span>
                      <span className="text-sm font-semibold">
                        {loading ? "—" : plan.value}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: plan.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total registrations</span>
                <span className="font-bold">
                  {loading ? "—" : stats.total}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#121824] p-5">
            <h3 className="font-semibold">Quick Actions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your gym operations.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["View Members", "/admin/members"],
                ["Manage Staff", "/admin/staff"],
                ["Payments", "/admin/payments"],
                ["Attendance", "/admin/attendance"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-xl border border-white/10 p-4 text-sm text-gray-300 transition hover:border-[#287BFF]/50 hover:bg-[#287BFF]/5"
                >
                  {label} <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#121824] p-5">
            <h3 className="font-semibold">Account Information</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Account</span>
                <span className="text-gray-300">FitNova Admin</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Email</span>
                <span className="max-w-[65%] truncate text-gray-300">{email}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Access Role</span>
                <span className="capitalize text-[#FF9A70]">{role}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">System</span>
                <span className="text-green-400">Connected</span>
              </div>
            </div>
          </section>
        </div>

        <p className="pb-4 text-center text-xs text-gray-600">
          FitNova Admin Panel · Membership data from Supabase
        </p>
      </div>
    </div>
  );
}
