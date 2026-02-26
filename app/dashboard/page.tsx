"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MovieCardWithWatchlist } from "@/components/MovieCardWithWatchlist";
import { fetchPopular, searchMovies, Movie, MovieResponse } from "@/lib/tmdb";
import { ReviewModal } from "@/components/ReviewModal";
import { Trash2, Check, Search, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

// Content components for each page
function HomeContent() {
  const watchlistItems = useQuery(api.myFunctions.getUserWatchlist);
  const watchedItems = useQuery(api.myFunctions.getUserWatched);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Movies</h3>
          <p className="text-3xl font-bold text-black">2,543</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Watched</h3>
          <p className="text-3xl font-bold text-black">
            {watchedItems === undefined ? "..." : watchedItems.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Watchlist</h3>
          <p className="text-3xl font-bold text-black">
            {watchlistItems === undefined ? "..." : watchlistItems.length}
          </p>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-black">Welcome to Filmboard Dashboard</h2>
      <p className="text-gray-600">Select an option from the sidebar to navigate</p>
    </div>
  );
}

function ExploreContent() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Load popular movies on mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const response = await fetchPopular();
        setMovies(response.results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movies");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // Reset to popular movies if search is cleared
      try {
        setIsSearching(true);
        const response = await fetchPopular();
        setMovies(response.results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movies");
      } finally {
        setIsSearching(false);
      }
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const response = await searchMovies(searchQuery);
      
      if (response.results.length === 0) {
        setError(`No movies found for "${searchQuery}"`);
        setMovies([]);
      } else {
        setMovies(response.results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search movies");
      setMovies([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(true);
    
    fetchPopular()
      .then((response) => {
        setMovies(response.results);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load movies");
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">Explore Movies</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">Explore Movies</h2>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {movies.map((movie, index) => (
            <MovieCardWithWatchlist key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      ) : !error && (
        <div className="bg-gray-100 rounded-2xl p-12 border border-gray-300 text-center">
          <p className="text-gray-600 font-semibold">No movies found</p>
          <p className="text-gray-500 text-sm mt-2">Try searching for a different movie</p>
        </div>
      )}
    </div>
  );
}

function WatchlistContent() {
  const [selectedMovie, setSelectedMovie] = useState<{ id: number; title: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const watchlistItems = useQuery(api.myFunctions.getUserWatchlist);

  if (watchlistItems === undefined) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">My Watchlist</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (watchlistItems.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">My Watchlist</h2>
        <div className="bg-gray-100 rounded-2xl p-12 border border-gray-300 text-center">
          <p className="text-gray-600 font-semibold">Your watchlist is empty</p>
          <p className="text-gray-500 text-sm mt-2">Add movies from the Explore section to build your watchlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">My Watchlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {watchlistItems.map((item, index) => (
          <WatchlistMovieCard
            key={item._id}
            item={item}
            index={index}
            onClickReview={() => setSelectedMovie({ id: item.movieId, title: item.title })}
          />
        ))}
      </div>
      {selectedMovie && (
        <ReviewModal
          movieId={selectedMovie.id}
          movieTitle={selectedMovie.title}
          onClose={() => setSelectedMovie(null)}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}

function WatchlistMovieCard({
  item,
  index,
  onClickReview
}: {
  item: any;
  index: number;
  onClickReview: () => void;
}) {
  const { addToast } = useToast();
  const review = useQuery(api.myFunctions.getMovieReview, { movieId: item.movieId });
  const removeFromWatchlist = useMutation(api.myFunctions.removeFromWatchlist);
  const addToWatched = useMutation(api.myFunctions.addToWatched);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    try {
      await removeFromWatchlist({ movieId: item.movieId });
      addToast(`${item.title} removed from watchlist`, "info", 2000);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      addToast("Failed to remove from watchlist", "error", 2000);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleMarkWatched = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMarkingWatched(true);
    try {
      await addToWatched({
        movieId: item.movieId,
        title: item.title,
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
      });
      addToast(`${item.title} marked as watched`, "success", 2000);
    } catch (error) {
      console.error("Error marking as watched:", error);
      addToast("Failed to mark as watched", "error", 2000);
    } finally {
      setIsMarkingWatched(false);
    }
  };

  return (
    <div
      key={item._id}
      className="group cursor-pointer animate-fade-in relative"
      onClick={onClickReview}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-lg bg-gray-200 shadow-lg hover:shadow-xl transition-shadow">
        {item.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/90 px-2 py-1 backdrop-blur-sm shadow-md">
          <span className="text-xs font-bold text-white">★ {item.vote_average.toFixed(1)}</span>
        </div>

        {/* Remove button */}
        <div className="absolute left-2 bottom-2 flex gap-2">
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-red-500/90 hover:bg-red-600 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
            title="Remove from watchlist"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>

          {/* Mark as watched button */}
          <button
            onClick={handleMarkWatched}
            disabled={isMarkingWatched}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-green-500/90 hover:bg-green-600 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
            title="Mark as watched"
          >
            <Check className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="absolute top-10 left-0 inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-start pl-12 pb-14 h-2 w-full">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white font-semibold text-sm bg-black/70 px-3 py-1 rounded-lg whitespace-nowrap">Add Review</p>
          </div>
        </div>
      </div>
      <h3 className="text-sm font-bold leading-tight line-clamp-1 text-black">{item.title}</h3>
      <p className="mt-0.5 text-xs text-gray-600">
        {item.release_date ? new Date(item.release_date).getFullYear() : "N/A"}
      </p>
      <p>
        {review ? (
          <span className="text-sm text-gray-800 mt-1 line-clamp-3">{review.reviewText}</span>
        ) : (
          <span className="text-sm text-gray-500 mt-1 italic">No review yet</span>
        )}
      </p>
      {review && (
        <div className="mt-2 flex items-center gap-1">
          {[...Array(Math.round(review.rating))].map((_, i) => (
            <span key={i} className="text-yellow-400">★</span>
          ))}
          {[...Array(10 - Math.round(review.rating))].map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-300">★</span>
          ))}
        </div>
      )}
    </div>
  );
}


function WatchedContent() {
  const { addToast } = useToast();
  const watchedItems = useQuery(api.myFunctions.getUserWatched);
  const removeFromWatched = useMutation(api.myFunctions.removeFromWatched);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  if (watchedItems === undefined) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">My Watched Movies</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (watchedItems.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">My Watched Movies</h2>
        <div className="bg-gray-100 rounded-2xl p-12 border border-gray-300 text-center">
          <p className="text-gray-600 font-semibold">You haven't watched any movies yet</p>
          <p className="text-gray-500 text-sm mt-2">Mark movies as watched from your watchlist to see them here</p>
        </div>
      </div>
    );
  }

  const handleRemove = async (movieId: number, movieTitle: string) => {
    setIsRemoving(movieId);
    try {
      await removeFromWatched({ movieId });
      addToast(`${movieTitle} removed from watched`, "info", 2000);
    } catch (error) {
      console.error("Error removing from watched:", error);
      addToast("Failed to remove from watched", "error", 2000);
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">My Watched Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {watchedItems.map((item, index) => (
          <div
            key={item._id}
            className="group cursor-pointer animate-fade-in relative"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-lg bg-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              {item.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/90 px-2 py-1 backdrop-blur-sm shadow-md">
                <span className="text-xs font-bold text-white">★ {item.vote_average.toFixed(1)}</span>
              </div>

              {/* Mark as unwatched button */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleRemove(item.movieId, item.title);
                }}
                disabled={isRemoving === item.movieId}
                className="absolute left-2 bottom-2 flex items-center justify-center h-9 w-9 rounded-lg bg-green-500/90 hover:bg-green-600 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                title="Unmark as watched"
              >
                <Check className="h-4 w-4 text-white" />
              </button>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-semibold text-sm bg-black/70 px-3 py-1 rounded-lg">Mark Unwatched</p>
                </div>
              </div>
            </div>
            <h3 className="text-sm font-bold leading-tight line-clamp-1 text-black">{item.title}</h3>
            <p className="mt-0.5 text-xs text-gray-600">
              {item.release_date ? new Date(item.release_date).getFullYear() : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendsContent() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const watchlistItems = useQuery(api.myFunctions.getUserWatchlist);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!watchlistItems || watchlistItems.length === 0) {
          setError("Add movies to your watchlist to get personalized recommendations");
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // Get last 5 movies from watchlist
        const last5 = watchlistItems.slice(-5);

        // Call recommendations API
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watchlistMovies: last5 }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load recommendations"
        );
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (watchlistItems !== undefined) {
      fetchRecommendations();
    }
  }, [watchlistItems]);

  if (watchlistItems === undefined) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">Recommended For You</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">Recommended For You</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">Recommended For You</h2>
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <p className="text-blue-800 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">Recommended For You</h2>
        <div className="bg-gray-100 rounded-2xl p-12 border border-gray-300 text-center">
          <p className="text-gray-600 font-semibold">No recommendations available</p>
          <p className="text-gray-500 text-sm mt-2">Try adding more movies to your watchlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((rec, index) => (
          <div
            key={`${rec.title}-${index}`}
            className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow shadow-lg group cursor-pointer"
          >
            {/* Movie Poster */}
            {rec.tmdbDetails?.poster_path ? (
              <div className="relative h-80 overflow-hidden bg-gray-200">
                <img
                  src={`https://image.tmdb.org/t/p/w500${rec.tmdbDetails.poster_path}`}
                  alt={rec.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                  <span>★ {rec.tmdbDetails.vote_average?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
            ) : (
              <div className="relative h-80 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">No Image</span>
              </div>
            )}

            {/* Movie Info */}
            <div className="p-4">
              <h3 className="font-bold text-black mb-1 text-lg line-clamp-2">
                {rec.title}
              </h3>
              <p className="text-gray-500 text-xs mb-3">{rec.year}</p>

              {/* AI Reasoning */}
              <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                <p className="text-xs font-semibold text-blue-900 mb-1">Why This Pick:</p>
                <p className="text-xs text-blue-800 line-clamp-3">{rec.reason}</p>
              </div>

              {/* Connection */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Connection:</p>
                <p className="text-xs text-gray-700 line-clamp-2">{rec.connection}</p>
              </div>

              <button className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-black/80 transition-all text-sm">
                Add to Watchlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileContent() {
  const user = useQuery(api.auth.getCurrentUser);

  if (user === undefined) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (user === null) {
    return <div className="text-center py-8">Unauthorized</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Profile</h2>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-bold text-black">{user.name}</p>
            <p className="text-sm text-gray-600">Premium Member</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-600">Email</p>
            <p className="text-black">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Member Since</p>
            <p className="text-black">January 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const contentMap = {
  home: <HomeContent />,
  explore: <ExploreContent />,
  watchlist: <WatchlistContent />,
  watched: <WatchedContent />,
  recommends: <RecommendsContent />,
  profile: <ProfileContent />,
};

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState("home");

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AppSidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <div className="ml-64 flex flex-1 flex-col">
        <TopBar activeItem={activeItem} />
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {contentMap[activeItem as keyof typeof contentMap] || <HomeContent />}
        </main>
      </div>
    </div>
  );
}
