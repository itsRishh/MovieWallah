const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

// Using TMDB's public API key for demo purposes
const API_KEY = "a805e9d274735429b84230b7e6165f7c";

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export interface MovieResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
  page: number;
}

export const getImageUrl = (path: string | null, size: string = "w500") => {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE}/${size}${path}`;
};

export const fetchTrending = async (): Promise<MovieResponse> => {
  const res = await fetch(`${TMDB_BASE}/trending/movie/week?api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch trending movies");
  return res.json();
};

export const fetchPopular = async (): Promise<MovieResponse> => {
  const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return res.json();
};

export const fetchTopRated = async (): Promise<MovieResponse> => {
  const res = await fetch(`${TMDB_BASE}/movie/top_rated?api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch top rated movies");
  return res.json();
};

export const searchMovies = async (query: string): Promise<MovieResponse> => {
  const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search movies");
  return res.json();
};
