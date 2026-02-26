"use client";

import { Movie, getImageUrl } from "@/lib/tmdb";
import { Star, Heart, Check } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useToast } from "./ToastProvider";

interface MovieCardWithWatchlistProps {
  movie: Movie;
  index?: number;
}

export function MovieCardWithWatchlist({ movie, index = 0 }: MovieCardWithWatchlistProps) {
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);
  const addToWatchlist = useMutation(api.myFunctions.addToWatchlist);
  const removeFromWatchlist = useMutation(api.myFunctions.removeFromWatchlist);
  const addToWatched = useMutation(api.myFunctions.addToWatched);
  const isInWatchlist = useQuery(api.myFunctions.checkInWatchlist, {
    movieId: movie.id,
  });
  const isInWatched = useQuery(api.myFunctions.checkInWatched, {
    movieId: movie.id,
  });

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding || isInWatchlist === undefined) return;

    setIsAdding(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist({ movieId: movie.id });
        addToast(`${movie.title} removed from watchlist`, "info", 2000);
      } else {
        await addToWatchlist({
          movieId: movie.id,
          title: movie.title,
          poster_path: movie.poster_path ?? undefined,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        });
        addToast(`${movie.title} added to watchlist`, "success", 2000);
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
      addToast("Failed to update watchlist", "error", 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleMarkWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMarkingWatched || isInWatched === undefined) return;

    setIsMarkingWatched(true);
    try {
      await addToWatched({
        movieId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path ?? undefined,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      });
      addToast(`${movie.title} marked as watched`, "success", 2000);
    } catch (error) {
      console.error("Error marking as watched:", error);
      addToast("Failed to mark as watched", "error", 2000);
    } finally {
      setIsMarkingWatched(false);
    }
  };

  return (
    <div
      className="group cursor-pointer animate-fade-in relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Poster */}
      <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-lg bg-gray-200 shadow-lg">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Rating badge */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/90 px-2 py-1 backdrop-blur-sm shadow-md">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-white">{movie.vote_average.toFixed(1)}</span>
        </div>

        {/* Buttons container */}
        <div className="absolute left-2 bottom-2 flex gap-2">
          {/* Heart button */}
          <button
            onClick={handleWatchlistClick}
            disabled={isAdding || isInWatchlist === undefined}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
            title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Heart
              className={`h-5 w-5 transition-all duration-200 ${
                isInWatchlist
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>

          {/* Mark as watched button */}
          {!isInWatched && (
            <button
              onClick={handleMarkWatched}
              disabled={isMarkingWatched}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500/90 hover:bg-green-600 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
              title="Mark as watched"
            >
              <Check className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold leading-tight line-clamp-1 text-black">{movie.title}</h3>
      <p className="mt-0.5 text-xs text-gray-600">
        {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
      </p>
    </div>
  );
}
