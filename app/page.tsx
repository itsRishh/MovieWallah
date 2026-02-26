"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Button from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MovieCard } from "@/components/MovieCard";
import AuthModal from "@/components/AuthModal";
import { fetchPopular, Movie } from "@/lib/tmdb";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await fetchPopular();
        // Shuffle and get random 12 movies
        const shuffled = data.results.sort(() => 0.5 - Math.random()).slice(0, 50);
        setMovies(shuffled);
      } catch (err) {
        setError("Failed to load movies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center shadow-lg gap-4">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl text-primary">MovieWallah</span>
        </div>
        <Button>
          <a href="/sign-in" className="text-white">Sign In</a>
        </Button>
      </nav>
      <main className="p-10 flex flex-col gap-10 bg-background rounded-lg shadow-lg mt-8 mx-auto max-w-7xl w-full">
        {/* Hero Section */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Discover Movies</h1>
          <p className="text-gray-600">Explore popular movies and add them to your watchlist</p>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500 text-lg">Loading movies...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500 text-lg">{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
                onClick={() => setShowAuthModal(true)}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}


