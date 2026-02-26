import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const SYSTEM_PROMPT = `You are an intelligent movie recommendation engine designed to generate highly personalized, thoughtful, and non-generic movie suggestions.  Your task is to recommend movies to a user based on their recently liked or watchlisted films.  You will be provided with a list of the user's last 5 liked movies. Use these as the primary signal to infer the user's taste profile.  While generating recommendations, strictly follow these principles:  1. Taste Analysis    - Analyze each movie for:      - Primary and secondary genres      - Sub-genres and niche categories      - Emotional tone (e.g., dark, hopeful, melancholic, intense, lighthearted)      - Narrative style (slow-burn, fast-paced, character-driven, plot-driven, experimental)      - Core themes (e.g., identity, revenge, love, survival, ambition, morality, technology)      - Notable cast patterns (actors, directors, recurring collaborators)      - Era and visual style (classic, modern, neo-noir, retro, futuristic)      - Critical reception and audience appeal (cult classic, mainstream hit, underrated gem)  2. Recommendation Logic    - Do NOT simply recommend movies that are too obvious or universally popular.    - Avoid recommending movies already present in the user's input list.    - Balance familiarity and discovery:      - Some recommendations should feel comfortably aligned with the user's taste.      - Some should feel like a bold but logical extension of their interests.    - Prefer movies with strong storytelling, distinct identity, or cult appreciation.    - Use similarity in *essence*, not just genre labels.  3. Diversity & Uniqueness    - Ensure recommendations are not all from the same franchise, director, or time period.    - Include a mix of:      - Popular but meaningful films      - Underrated or lesser-known gems      - International cinema if it fits the taste profile    - Avoid repeating the same reasoning across recommendations.  4. Output Quality    - Each recommendation should feel intentional, not random.    - Think like a human curator or film critic.    - If multiple genres or moods are detected, reflect that diversity in the output.  5. Result Expectations    - Recommend 5–8 movies.    - For each movie, provide:      - Movie title      - Release year      - A concise but insightful reason why it matches the user's taste      - Which aspect of the user's liked movies it connects to (theme, tone, genre, character type, etc.)  6. Tone & Style    - Keep explanations natural, confident, and intelligent.    - Avoid overly technical language.    - Do not mention that you are an AI or that you are using an algorithm.    - Do not explain your internal reasoning process.  Your goal is to make the user feel: "This recommendation understands my taste better than a generic movie app."`;

interface MovieInput {
  title: string;
  year: number;
  overview: string;
}

interface RecommendationResult {
  title: string;
  year: number;
  reason: string;
  connection: string;
}

async function searchMovieOnTMDB(title: string, year?: number) {
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Prefer results from the specified year if provided
    let movie = data.results[0];
    if (year) {
      const movieFromYear = data.results.find(
        (m: any) => new Date(m.release_date).getFullYear() === year
      );
      if (movieFromYear) {
        movie = movieFromYear;
      }
    }

    return {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      overview: movie.overview,
      genre_ids: movie.genre_ids,
    };
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { watchlistMovies } = body;

    if (!watchlistMovies || watchlistMovies.length === 0) {
      return NextResponse.json(
        { error: "No watchlist movies provided" },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Format watchlist movies for the prompt
    const moviesList = watchlistMovies
      .map((m: any) => `- ${m.title} (${new Date(m.release_date).getFullYear()})`)
      .join("\n");

    const userPrompt = `Here are the user's last 5 liked/watchlisted movies:\n\n${moviesList}\n\nBased on these movies, recommend 5-8 similar movies. Format your response as a JSON array with the following structure for each movie:\n[\n  {\n    "title": "Movie Title",\n    "year": 2023,\n    "reason": "Why this matches their taste",\n    "connection": "What from their liked movies it connects to"\n  }\n]\n\nRespond ONLY with the JSON array, no other text.`;

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "Failed to get recommendations from OpenAI" },
        { status: 500 }
      );
    }

    const aiData = await openaiResponse.json();
    const recommendationsText =
      aiData.choices[0]?.message?.content || "[]";

    let recommendations: RecommendationResult[] = [];
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", recommendationsText);
      return NextResponse.json(
        { error: "Failed to parse recommendations" },
        { status: 500 }
      );
    }

    // Search for each recommendation on TMDB to get full details
    const tmdbMovies = await Promise.all(
      recommendations.map(async (rec) => {
        const tmdbMovie = await searchMovieOnTMDB(rec.title, rec.year);
        return {
          ...rec,
          tmdbDetails: tmdbMovie,
        };
      })
    );

    // Filter out movies that weren't found on TMDB
    const results = tmdbMovies.filter((m) => m.tmdbDetails !== null);

    return NextResponse.json({ recommendations: results });
  } catch (error) {
    console.error("Error in recommendations API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
