
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed.");
        return;
      }

      router.push("/admin/login?registered=true");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090B12] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#287BFF] text-white">
            <Dumbbell size={28} />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Fit<span className="text-[#287BFF]">Nova</span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Create your gym owner account
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5 rounded-2xl border border-white/10 bg-[#121622] p-7 shadow-2xl"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">
              Owner Registration
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Register to manage your gym.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Full Name
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-white outline-none focus:border-[#287BFF]"
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
                minLength={8}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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
                Creating Account...
              </>
            ) : (
              "Create Owner Account"
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already registered?{" "}
            <Link
              href="/admin/login"
              className="font-semibold text-[#287BFF] hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
