
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCog,
  CalendarCheck,
  BarChart3,
  Settings,
  LogOut,
  Dumbbell,
  Menu,
  X,
  Loader2,
  Award,
  Images,
  MessageSquare,
} from "lucide-react";

const ACCESS_KEY = "fitnova_admin_access";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { name: "Trainers", href: "/admin/trainers", icon: Award },
  { name: "Gallery", href: "/admin/gallery", icon: Images },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Staff", href: "/admin/staff", icon: UserCog },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/register";

  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    async function verifyUser() {
      const hasAccess =
        sessionStorage.getItem(ACCESS_KEY) === "granted";

      if (!hasAccess) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        sessionStorage.removeItem(ACCESS_KEY);
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const { data, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !data) {
        sessionStorage.removeItem(ACCESS_KEY);
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setName(user.user_metadata?.full_name || "Admin");
      setEmail(user.email || "");
      setRole(data.role);
      setLoading(false);
    }

    verifyUser();
  }, [router, pathname, isAuthPage]);

  useEffect(() => {
    if (isAuthPage) return;

    const clearAccess = () => {
      sessionStorage.removeItem(ACCESS_KEY);
    };

    window.addEventListener("beforeunload", clearAccess);

    return () => {
      window.removeEventListener("beforeunload", clearAccess);
    };
  }, [isAuthPage]);

  async function handleLogout() {
    sessionStorage.removeItem(ACCESS_KEY);
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090B12] text-white">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2 className="animate-spin text-[#287BFF]" size={20} />
          Verifying admin account...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B12] text-white">
      {mobileMenu && (
        <button
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#101521] transition-transform lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#287BFF]">
              <Dumbbell size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Fit<span className="text-[#287BFF]">Nova</span>
              </h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenu(false)}
            className="text-gray-400 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenu(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  active
                    ? "bg-[#287BFF]/15 font-semibold text-[#5B9AFF]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.name}
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#287BFF]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-gray-500">{email}</p>
            <span className="mt-2 inline-block rounded-md bg-[#FF7438]/10 px-2 py-1 text-xs capitalize text-[#FF9A70]">
              {role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="text-gray-300 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-lg font-semibold">
                {navigation.find((item) =>
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href)
                )?.name || "Admin"}
              </h2>
              <p className="text-xs text-gray-500">FitNova Management</p>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5"
          >
            View Website ↗
          </Link>
        </header>

        {children}
      </main>
    </div>
  );
}
