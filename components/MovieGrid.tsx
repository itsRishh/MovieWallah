import { Movie } from "@/lib/tmdb";
import { MovieCard } from "@/components/MovieCard";

interface MovieGridProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
}

export function MovieGrid({ title, movies, isLoading }: MovieGridProps) {
  return (
    <section className="mb-8">
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-3 aspect-[2/3] rounded-lg bg-muted" />
              <div className="mb-1 h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
