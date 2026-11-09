
"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Dumbbell, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "3,000",
    description: "A strong start to your fitness journey.",
    icon: Dumbbell,
    features: [
      "Gym access",
      "Modern equipment",
      "Locker facility",
      "Workout guidance",
    ],
  },
  {
    name: "Standard",
    price: "5,000",
    description: "More support for better results.",
    icon: Zap,
    popular: true,
    features: [
      "Everything in Basic",
      "Training guidance",
      "Cardio sessions",
      "Fitness assessment",
    ],
  },
  {
    name: "Premium",
    price: "8,000",
    description: "The complete fitness experience.",
    icon: Crown,
    features: [
      "Everything in Standard",
      "Personal trainer",
      "Custom workout plan",
      "Priority support",
    ],
  },
];

export default function Membership() {
  return (
    <section
      id="membership"
      className="relative scroll-mt-24 bg-[#090B12] px-5 py-24 text-white sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[4px] text-[#FF7438]">
            MEMBERSHIP PLANS
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-5xl">
            INVEST IN YOUR{" "}
            <span className="text-[#287BFF]">FITNESS.</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-gray-400">
            Choose the membership that matches your goals and start building
            a stronger, healthier you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? "border-[#287BFF] bg-[#111A2D]"
                    : "border-white/10 bg-[#101521] hover:border-white/25"
                }`}
              >
                {plan.popular && (
                  <span className="absolute right-6 top-6 rounded-full bg-[#287BFF]/15 px-3 py-1 text-[9px] font-bold tracking-wider text-[#287BFF]">
                    MOST POPULAR
                  </span>
                )}

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#287BFF]/10 text-[#287BFF]">
                  <Icon size={24} />
                </div>

                <h3 className="mt-7 text-xl font-black">{plan.name}</h3>

                <p className="mt-2 min-h-10 text-xs leading-5 text-gray-400">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl font-black">
                    Rs. {plan.price}
                  </span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>

                <div className="my-7 h-px bg-white/10" />

                <ul className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-xs text-gray-300"
                    >
                      <Check size={15} className="shrink-0 text-[#287BFF]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/membership?plan=${encodeURIComponent(plan.name)}`}
                  className={`group mt-9 flex items-center justify-between rounded-lg px-5 py-4 text-xs font-bold tracking-wider transition ${
                    plan.popular
                      ? "bg-[#287BFF] text-white hover:bg-[#FF7438]"
                      : "border border-white/15 text-white hover:border-[#287BFF] hover:bg-[#287BFF]"
                  }`}
                >
                  JOIN NOW
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
