"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "./ToastProvider";

interface ReviewModalProps {
  movieId: number;
  movieTitle: string;
  initialRating?: number;
  initialReview?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewModal({
  movieId,
  movieTitle,
  initialRating = 0,
  initialReview = "",
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const { addToast } = useToast();
  const [rating, setRating] = useState<number>(initialRating);
  const [reviewText, setReviewText] = useState<string>(initialReview);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addReview = useMutation(api.myFunctions.addReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 10) {
      setError("Rating must be between 1 and 10");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a review");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addReview({
        movieId,
        movieTitle,
        rating,
        reviewText,
      });
      addToast(`Review added for ${movieTitle}`, "success", 2000);
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit review";
      setError(errorMessage);
      addToast("Failed to add review", "error", 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-black line-clamp-1">{movieTitle}</h2>
            <p className="text-xs text-gray-600 mt-1">Write your review</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex-shrink-0 text-gray-500 hover:text-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Rating Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black">
              Rating (1-10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="flex gap-1">
                {[...Array(Math.round(rating))].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                {[...Array(10 - Math.round(rating))].map((_, i) => (
                  <Star
                    key={`empty-${i}`}
                    className="h-5 w-5 text-gray-300"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black">
              Your Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
