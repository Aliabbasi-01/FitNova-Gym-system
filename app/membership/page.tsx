"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  ArrowRight,
  Check,
  Dumbbell,
  Crown,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const plans = [
  {
    name: "Basic",
    price: "3,000",
    description: "A strong start to your fitness journey.",
    icon: Dumbbell,
    features: ["Gym access", "Modern equipment", "Locker facility", "Workout guidance"],
  },
  {
    name: "Standard",
    price: "5,000",
    description: "More support for better results.",
    icon: Zap,
    popular: true,
    features: ["Everything in Basic", "Training guidance", "Cardio sessions", "Fitness assessment"],
  },
  {
    name: "Premium",
    price: "8,000",
    description: "The complete fitness experience.",
    icon: Crown,
    features: ["Everything in Standard", "Personal trainer", "Custom workout plan", "Priority support"],
  },
];

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState("Standard");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planFromUrl = params.get("plan");

    const matchedPlan = plans.find(
      (plan) => plan.name.toLowerCase() === planFromUrl?.toLowerCase()
    );

    if (matchedPlan) {
      setSelectedPlan(matchedPlan.name);
    }
  }, []);

  const selected = plans.find((plan) => plan.name === selectedPlan)!;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.age) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("members")
        .insert({
          full_name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          age: Number(form.age),
          plan: selectedPlan,
        });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Membership registration error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090B12] px-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101521] p-8 text-center">
          <CheckCircle2 size={55} className="mx-auto text-[#287BFF]" />

          <p className="mt-6 text-xs font-bold tracking-[3px] text-[#FF7438]">
            REGISTRATION RECEIVED
          </p>

          <h1 className="mt-3 text-3xl font-black">
            YOU'RE ONE STEP <span className="text-[#287BFF]">CLOSER.</span>
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-400">
            Thank you, {form.name}. Your {selectedPlan} membership request has
            been received.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-3 bg-[#287BFF] px-6 py-4 text-xs font-bold text-white transition hover:bg-[#FF7438]"
          >
            BACK TO HOME <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090B12] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 mt-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#287BFF]/10 text-[#287BFF]">
            <Dumbbell size={25} />
          </div>

          <p className="mt-5 text-[10px] font-bold tracking-[4px] text-[#FF7438]">
            START YOUR JOURNEY
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            BECOME A <span className="text-[#287BFF]">MEMBER.</span>
          </h1>

          <p className="mt-3 text-xs text-gray-400">
            Choose your plan and complete your registration.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <h2 className="mb-5 text-lg font-bold">01. Choose Your Plan</h2>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const active = selectedPlan === plan.name;

                return (
                  <button
                    type="button"
                    key={plan.name}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`relative rounded-xl border p-5 text-left transition ${
                      active
                        ? "border-[#287BFF] bg-[#111A2D]"
                        : "border-white/10 bg-[#101521] hover:border-white/30"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute right-4 top-4 text-[8px] font-bold tracking-wider text-[#FF7438]">
                        POPULAR
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="text-[#287BFF]" />
                        <span className="font-bold">{plan.name}</span>
                      </div>

                      <span className="text-lg font-black">
                        Rs. {plan.price}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-gray-400">
                      {plan.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {plan.features.map((feature) => (
                        <span
                          key={feature}
                          className="flex items-center gap-1.5 text-[9px] text-gray-300"
                        >
                          <Check size={12} className="shrink-0 text-[#287BFF]" />
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          active
                            ? "border-[#287BFF] bg-[#287BFF]"
                            : "border-gray-600"
                        }`}
                      >
                        {active && <Check size={11} />}
                      </span>

                      {active ? "SELECTED PLAN" : "SELECT THIS PLAN"}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="h-fit rounded-2xl border border-white/10 bg-[#101521] p-6 sm:p-8">
            <h2 className="text-lg font-bold">02. Your Information</h2>

            <p className="mt-1 text-xs text-gray-500">
              Fill in your details to request membership.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                  FULL NAME
                </span>

                <input
                  required
                  minLength={3}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                  EMAIL ADDRESS
                </span>

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                  PHONE NUMBER
                </span>

                <input
                  required
                  type="tel"
                  pattern="[0-9+() -]{10,20}"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                  AGE
                </span>

                <input
                  required
                  type="number"
                  min="16"
                  max="100"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Enter your age"
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF]"
                />
              </label>

              <div className="rounded-lg border border-[#287BFF]/20 bg-[#287BFF]/[0.06] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Selected plan</span>
                  <span className="text-xs font-bold text-white">
                    {selected.name}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-gray-400">Monthly fee</span>
                  <span className="text-xl font-black text-[#287BFF]">
                    Rs. {selected.price}
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-between rounded-lg bg-[#287BFF] px-5 py-4 text-xs font-bold tracking-wider text-white transition hover:bg-[#FF7438] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "SUBMITTING..." : "SUBMIT REGISTRATION"}

                {!loading && (
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                )}
              </button>

              <p className="text-center text-[9px] leading-5 text-gray-500">
                Your membership request will be saved securely in our database.
                No payment is collected at this stage.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}