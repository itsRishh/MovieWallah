import { Movie, getImageUrl } from "@/lib/tmdb";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  index?: number;
  onClick?: () => void;
}

export function MovieCard({ movie, index = 0, onClick }: MovieCardProps) {
  return (
    <div
      className="group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Rating badge */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-card/90 px-2 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-rating text-rating" />
          <span className="text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold leading-tight line-clamp-1">{movie.title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
      </p>
    </div>
  );
}
