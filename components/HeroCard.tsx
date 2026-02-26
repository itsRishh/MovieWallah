import { Movie, getImageUrl } from "@/lib/tmdb";
import { Star, Play } from "lucide-react";

interface HeroCardProps {
  movie: Movie;
}

export function HeroCard({ movie }: HeroCardProps) {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
      <img
        src={getImageUrl(movie.backdrop_path, "w1280")}
        alt={movie.title}
        className="h-full w-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-6">
        <div className="mb-2 flex items-center gap-2">
          <Star className="h-4 w-4 fill-rating text-rating" />
          <span className="text-sm font-bold text-primary-foreground">{movie.vote_average.toFixed(1)}</span>
          <span className="text-sm text-primary-foreground/60">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : ""}
          </span>
        </div>
        <h2 className="mb-2 text-2xl font-black text-primary-foreground">{movie.title}</h2>
        <p className="line-clamp-2 max-w-lg text-sm text-primary-foreground/70">{movie.overview}</p>
        <button className="mt-4 flex items-center gap-2 rounded-lg bg-primary-foreground px-4 py-2 text-sm font-bold text-primary transition-opacity hover:opacity-90">
          <Play className="h-4 w-4" />
          Watch Now
        </button>
      </div>
    </div>
  );
}
