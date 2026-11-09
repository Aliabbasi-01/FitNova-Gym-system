
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Star,
  Quote,
  Send,
  Loader2,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Review = {
  id: string;
  name: string;
  rating: number;
  review: string;
  created_at: string;
};

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, rating, review, created_at")
        .eq("status", "Approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Reviews loading error:", error);
      } else {
        setReviews((data || []) as Review[]);
      }

      setLoading(false);
    };

    loadReviews();
  }, []);

  const submitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          name: name.trim(),
          rating,
          review: review.trim(),
          status: "Pending",
        });

      if (insertError) throw insertError;

      setName("");
      setRating(5);
      setReview("");
      setShowForm(false);
      setSuccess(true);
    } catch (err) {
      console.error("Review submission error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReview = (id: string) => {
    setExpandedReviews((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[#0D101A] px-5 py-16 sm:px-6 lg:py-20"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-[#287BFF]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#FF7438]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-[#FF7438]" />
              <p className="text-[10px] font-bold tracking-[3px] text-[#FF7438]">
                REAL PEOPLE. REAL PROGRESS.
              </p>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              MEMBER <span className="text-[#287BFF]">STORIES.</span>
            </h2>

            <p className="mt-2 text-xs text-gray-500">
              Real experiences from the FitNova community.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <p className="max-w-xs text-xs leading-6 text-gray-400">
              Your experience matters. Share your fitness journey with us.
            </p>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setSuccess(false);
                setError("");
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#287BFF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600"
            >
              <MessageSquare size={15} />
              {showForm ? "Close Form" : "Write a Review"}
            </button>
          </div>
        </div>

        {/* Review Form */}
        {showForm && (
          <form
            onSubmit={submitReview}
            className="mb-8 rounded-2xl border border-white/10 bg-[#101521] p-5 sm:p-6"
          >
            <div className="mb-5">
              <p className="text-[10px] font-bold tracking-[2px] text-[#287BFF]">
                YOUR FEEDBACK
              </p>
              <h3 className="mt-1 text-lg font-bold text-white">
                Share Your Experience
              </h3>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-gray-300">
                Your Name
              </label>

              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#287BFF]"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-gray-300">
                Your Rating
              </label>

              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(index + 1)}
                    aria-label={`Rate ${index + 1} stars`}
                    className="transition hover:scale-110"
                  >
                    <Star
                      size={27}
                      fill={index < rating ? "#FF7438" : "transparent"}
                      className={
                        index < rating
                          ? "text-[#FF7438]"
                          : "text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold text-gray-300">
                Your Review
              </label>

              <textarea
                required
                minLength={5}
                maxLength={1000}
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full resize-none rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#287BFF]"
              />
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-[#287BFF] px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {submitting ? "Submitting..." : "Submit Review"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="rounded-lg border border-white/10 px-5 py-3 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Submission Success */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            <CheckCircle2 size={19} />
            Thank you! Your review has been submitted for approval.
          </div>
        )}

        {/* Reviews */}
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-400">
            <Loader2 size={22} className="animate-spin text-[#287BFF]" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#101521] px-5 py-12 text-center">
            <MessageSquare
              size={30}
              className="mx-auto mb-4 text-[#287BFF]"
            />
            <h3 className="font-semibold text-white">No reviews yet</h3>
            <p className="mt-2 text-sm text-gray-400">
              Be the first to share your experience with FitNova.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((item) => {
              const isExpanded = expandedReviews.includes(item.id);
              const isLong = item.review.length > 130;

              return (
                <article
                  key={item.id}
                  className="group relative flex h-[230px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101521] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#287BFF]/50 hover:shadow-[0_12px_35px_rgba(40,123,255,0.08)]"
                >
                  {/* Accent line */}
                  <div className="absolute left-0 top-0 h-1 w-12 rounded-br-full bg-gradient-to-r from-[#287BFF] to-[#FF7438]" />

                  {/* Rating */}
                  <div className="flex shrink-0 items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-[#FF7438]/15 bg-[#FF7438]/5 px-2.5 py-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          fill={i < item.rating ? "currentColor" : "transparent"}
                          className={
                            i < item.rating
                              ? "text-[#FF7438]"
                              : "text-gray-600"
                          }
                        />
                      ))}
                    </div>

                    <Quote
                      size={23}
                      className="text-[#287BFF]/40 transition group-hover:text-[#287BFF]"
                    />
                  </div>

                  {/* Review text - fixed available area */}
                  <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                    <p
                      className={`break-words text-[13px] leading-6 text-gray-300 ${
                        isExpanded
                          ? "h-full overflow-y-auto pr-2 [scrollbar-color:#287BFF_transparent] [scrollbar-width:thin]"
                          : "line-clamp-3"
                      }`}
                    >
                      “{item.review}”
                    </p>
                  </div>

                  {/* See More - reserved space */}
                  <div className="mt-1 flex h-5 shrink-0 items-center">
                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleReview(item.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#5B9AFF] transition hover:text-white"
                      >
                        {isExpanded ? (
                          <>
                            See Less <ChevronUp size={13} />
                          </>
                        ) : (
                          <>
                            See More <ChevronDown size={13} />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Member profile */}
                  <div className="mt-3 flex shrink-0 items-center gap-2.5 border-t border-white/10 pt-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#287BFF]/20 bg-[#287BFF]/10 text-sm font-black text-[#5B9AFF]">
                      {item.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-bold text-white">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-gray-500">
                        FitNova Member
                      </p>
                    </div>

                    <div className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.03]">
                      <CheckCircle2
                        size={14}
                        className="text-[#287BFF]"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
