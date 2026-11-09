
"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ArrowUpRight,
  Dumbbell,
} from "lucide-react";

const details = [
  { icon: MapPin, label: "VISIT US", value: "Your Gym Address, Pakistan" },
  { icon: Phone, label: "CALL US", value: "+92 300 1234567" },
  { icon: Mail, label: "EMAIL US", value: "info@fitnova.com" },
  { icon: Clock, label: "OPENING HOURS", value: "Mon – Sat · 6 AM – 11 PM" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    e.currentTarget.reset();
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#090B12] px-5 py-16 sm:px-8 lg:py-20"
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#287BFF]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#FF7438]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF7438]" />
              <p className="text-[10px] font-bold tracking-[3px] text-[#FF7438]">
                CONNECT WITH FITNOVA
              </p>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              LET'S MAKE IT <span className="text-[#287BFF]">HAPPEN.</span>
            </h2>
          </div>

          <p className="max-w-xs text-xs leading-6 text-gray-400">
            Your fitness journey starts with one conversation.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Contact Information */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101521] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#287BFF]/20" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#FF7438]/20" />

            <div className="relative">
              <div className="flex items-center gap-2 text-[#287BFF]">
                <Dumbbell size={19} />
                <span className="text-xs font-black tracking-[2px] text-white">
                  FITNOVA<span className="text-[#FF7438]">.</span>
                </span>
              </div>

              <h3 className="mt-9 max-w-sm text-3xl font-black leading-tight text-white sm:text-4xl">
                READY TO
                <br />
                <span className="text-[#287BFF]">GET STRONGER?</span>
              </h3>

              <p className="mt-3 max-w-xs text-xs leading-6 text-gray-400">
                Talk to our team about memberships, training and everything
                you need to get started.
              </p>

              <div className="my-8 h-px bg-gradient-to-r from-[#287BFF]/70 via-white/10 to-transparent" />

              <div className="space-y-5">
                {details.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="group flex items-center gap-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[#287BFF] transition duration-300 group-hover:border-[#287BFF]/50 group-hover:bg-[#287BFF] group-hover:text-white">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] font-bold tracking-[2px] text-gray-500">
                          {item.label}
                        </p>
                        <p className="mt-1 break-words text-xs font-medium text-gray-200">
                          {item.value}
                        </p>
                      </div>

                      <span className="ml-auto text-[9px] text-gray-700">
                        0{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-[9px] font-bold tracking-[2px] text-gray-500">
                  TRAIN DIFFERENT.
                </span>

              
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E121D] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-8">
            <div className="absolute right-0 top-0 h-1 w-32 bg-gradient-to-l from-[#FF7438] to-[#287BFF]" />

            <div className="mb-7 flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold tracking-[3px] text-[#287BFF]">
                  DROP US A LINE
                </p>
                <h3 className="mt-2 text-xl font-black text-white">
                  Send a Message
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#287BFF]/10 text-[#287BFF]">
                <Send size={18} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              onChange={() => setSubmitted(false)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                    YOUR NAME
                  </span>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                    EMAIL ADDRESS
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF]/20"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                  PHONE NUMBER
                </span>
                <input
                  required
                  type="tel"
                  placeholder="+92 300 1234567"
                  className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF]/20"
                />
              </label>

              <label className="mt-5 block">
                <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400">
                  YOUR MESSAGE
                </span>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#090B12] px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF]/20"
                />
              </label>

              <button
                type="submit"
                className="group mt-5 flex w-full items-center justify-between rounded-lg bg-[#287BFF] px-5 py-4 text-xs font-bold tracking-wider text-white transition duration-300 hover:bg-[#FF7438]"
              >
                <span>
                  {submitted ? "MESSAGE SUBMITTED" : "SEND YOUR MESSAGE"}
                </span>

                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </button>

              <p className="mt-4 text-center text-[10px] text-gray-600">
                We look forward to hearing from you.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
