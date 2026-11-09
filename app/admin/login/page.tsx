
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError || !data.user) {
        setError(authError?.message || "Login failed.");
        return;
      }

      const { data: role, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (roleError || !role) {
        await supabase.auth.signOut();
        setError("You don't have admin access.");
        return;
      }
sessionStorage.setItem("fitnova_admin_access", "granted");
      router.replace("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090B12] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#287BFF] text-white">
            <Dumbbell size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Fit<span className="text-[#287BFF]">Nova</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Gym administration portal
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5 rounded-2xl border border-white/10 bg-[#121622] p-7 shadow-2xl"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">Admin Login</h2>
            <p className="mt-1 text-sm text-gray-400">
              Sign in to manage your gym.
            </p>
          </div>

          {searchParams.get("registered") === "true" && (
            <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              Account created successfully. Please log in.
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-white outline-none focus:border-[#287BFF]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 pr-12 text-white outline-none focus:border-[#287BFF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#287BFF] py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Login to Dashboard"
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            Owner account not created?{" "}
            <Link
              href="/admin/register"
              className="font-semibold text-[#287BFF] hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#090B12]" />}>
      <LoginForm />
    </Suspense>
  );
}
