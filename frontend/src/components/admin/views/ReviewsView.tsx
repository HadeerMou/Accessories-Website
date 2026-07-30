"use client";

import type * as React from "react";
import { useState } from "react";
import { Star } from "lucide-react";

import { Heading } from "@/components/admin/shared/Heading";
import { API_BASE, authHeaders } from "@/lib/admin/api";
import type { AdminReview } from "@/lib/admin/types";

type ReviewsViewProps = {
  reviews: AdminReview[];
  setReviews: React.Dispatch<React.SetStateAction<AdminReview[]>>;
  token: string;
  notify: (message: string) => void;
};

export function ReviewsView({
  reviews,
  setReviews,
  token,
  notify,
}: ReviewsViewProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const removeReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`${API_BASE}/reviews/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews((items) =>
        items.filter((review) => review.id !== id),
      );
      notify("Review deleted successfully");
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "Error deleting review",
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="animate-in space-y-6 fade-in slide-in-from-bottom-4 duration-500">
      <Heading
        title="Reviews"
        copy="Monitor and manage customer reviews."
      />

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-[#fcfbf9] text-xs uppercase tracking-wider text-black/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">
                  Customer
                </th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">
                  Comment
                </th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5">
              {reviews.map((review) => (
                <tr
                  key={review.id}
                  className="transition-colors hover:bg-black/[0.01]"
                >
                  <td className="px-6 py-4 font-medium">
                    {review.product.nameEn}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {review.user.fullName}
                    </div>
                    <div className="text-xs text-black/40">
                      {review.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-0.5 text-[#d1ae68]">
                      {Array.from({
                        length: review.rating,
                      }).map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="max-w-xs truncate text-black/70"
                      title={review.comment || ""}
                    >
                      {review.comment || (
                        <span className="italic text-black/30">
                          No comment
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black/60">
                    {new Date(
                      review.createdAt,
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => void removeReview(review.id)}
                      disabled={deleting === review.id}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      {deleting === review.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

              {reviews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-black/40"
                  >
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
