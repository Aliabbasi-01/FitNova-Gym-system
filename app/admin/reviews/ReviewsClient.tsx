
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Star,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

type ReviewStatus = "Pending" | "Approved" | "Rejected";

type Review = {
  id: string;
  name: string;
  rating: number;
  review: string;
  status: ReviewStatus;
  created_at: string;
};

type FilterType = "All" | ReviewStatus;

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchReviews() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Please login again to manage reviews.");
      setLoading(false);
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
      !["owner", "manager"].includes(roleData.role)
    ) {
      setError("Only the owner and manager can manage reviews.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("reviews")
      .select("id, name, rating, review, status, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setReviews((data || []) as Review[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function updateReviewStatus(
    id: string,
    status: ReviewStatus
  ) {
    setUpdatingId(id);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("reviews")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setUpdatingId(null);
      return;
    }

    setReviews((current) =>
      current.map((review) =>
        review.id === id ? { ...review, status } : review
      )
    );

    setMessage(`Review ${status.toLowerCase()} successfully.`);
    setUpdatingId(null);
  }

  async function deleteReview(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this review?"
    );

    if (!confirmed) return;

    setUpdatingId(id);
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setUpdatingId(null);
      return;
    }

    setReviews((current) =>
      current.filter((review) => review.id !== id)
    );

    setMessage("Review deleted successfully.");
    setUpdatingId(null);
  }

  const counts = {
    All: reviews.length,
    Pending: reviews.filter((r) => r.status === "Pending").length,
    Approved: reviews.filter((r) => r.status === "Approved").length,
    Rejected: reviews.filter((r) => r.status === "Rejected").length,
  };

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesFilter =
        filter === "All" || review.status === filter;

      const matchesSearch =
        !query ||
        review.name.toLowerCase().includes(query) ||
        review.review.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [reviews, filter, search]);

  const filters: FilterType[] = [
    "All",
    "Pending",
    "Approved",
    "Rejected",
  ];

  return (
    <div className="space-y-6 p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer Reviews</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage customer feedback and website testimonials.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Total Reviews",
            value: counts.All,
            icon: MessageSquare,
            color: "text-blue-400",
          },
          {
            label: "Pending",
            value: counts.Pending,
            icon: Clock3,
            color: "text-orange-400",
          },
          {
            label: "Approved",
            value: counts.Approved,
            icon: CheckCircle2,
            color: "text-green-400",
          },
          {
            label: "Rejected",
            value: counts.Rejected,
            icon: XCircle,
            color: "text-red-400",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#101521] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{item.label}</p>
                <Icon size={19} className={item.color} />
              </div>
              <p className="mt-3 text-2xl font-bold">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#101521] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                filter === item
                  ? "bg-[#287BFF] font-semibold text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {item} ({counts[item]})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full rounded-xl border border-white/10 bg-[#090B12] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-60 items-center justify-center gap-3 text-sm text-gray-400">
          <Loader2 className="animate-spin text-[#287BFF]" size={22} />
          Loading reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#101521] text-center">
          <MessageSquare size={35} className="mb-3 text-gray-600" />
          <h3 className="font-semibold">No reviews found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Customer reviews will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-white/10 bg-[#101521] p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#287BFF]/15 text-lg font-bold text-[#5B9AFF]">
                    {review.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="font-semibold">{review.name}</h3>

                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={15}
                          className={
                            index < review.rating
                              ? "fill-[#FFB547] text-[#FFB547]"
                              : "text-gray-600"
                          }
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {review.created_at
                        .replace("T", " ")
                        .slice(0, 16)}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    review.status === "Approved"
                      ? "bg-green-500/10 text-green-400"
                      : review.status === "Rejected"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-orange-500/10 text-orange-400"
                  }`}
                >
                  {review.status}
                </span>
              </div>

              <div className="my-4 rounded-xl bg-[#090B12] p-4">
                <p className="text-sm leading-7 text-gray-300">
                  {review.review}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {review.status !== "Approved" && (
                  <button
                    onClick={() =>
                      updateReviewStatus(review.id, "Approved")
                    }
                    disabled={updatingId === review.id}
                    className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                  >
                    {updatingId === review.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    Approve
                  </button>
                )}

                {review.status !== "Rejected" && (
                  <button
                    onClick={() =>
                      updateReviewStatus(review.id, "Rejected")
                    }
                    disabled={updatingId === review.id}
                    className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/20 disabled:opacity-50"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                )}

                <button
                  onClick={() => deleteReview(review.id)}
                  disabled={updatingId === review.id}
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
