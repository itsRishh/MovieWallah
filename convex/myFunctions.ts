import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// Watchlist mutations
export const addToWatchlist = mutation({
  args: {
    movieId: v.number(),
    title: v.string(),
    poster_path: v.optional(v.string()),
    vote_average: v.number(),
    release_date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const userId = identity.subject;

    // Check if movie is already in watchlist
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    if (existing) throw new Error("Movie already in watchlist");

    const id = await ctx.db.insert("watchlist", {
      userId,
      userName: identity.name || "Unknown",
      name: identity.name || "Unknown",
      movieId: args.movieId,
      title: args.title,
      poster_path: args.poster_path,
      vote_average: args.vote_average,
      release_date: args.release_date,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const removeFromWatchlist = mutation({
  args: {
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const userId = identity.subject;

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});

export const checkInWatchlist = query({
  args: {
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const userId = identity.subject;

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    return !!item;
  },
});

export const getUserWatchlist = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    const items = await ctx.db
      .query("watchlist")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return items;
  },
});

// Watched movies mutations
export const addToWatched = mutation({
  args: {
    movieId: v.number(),
    title: v.string(),
    poster_path: v.optional(v.string()),
    vote_average: v.number(),
    release_date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const userId = identity.subject;

    // Check if movie is already marked as watched
    const existing = await ctx.db
      .query("watched")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    if (existing) throw new Error("Movie already marked as watched");

    const id = await ctx.db.insert("watched", {
      userId,
      userName: identity.name || "Unknown",
      name: identity.name || "Unknown",
      movieId: args.movieId,
      title: args.title,
      poster_path: args.poster_path,
      vote_average: args.vote_average,
      release_date: args.release_date,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const removeFromWatched = mutation({
  args: {
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const userId = identity.subject;

    const item = await ctx.db
      .query("watched")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});

export const checkInWatched = query({
  args: {
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const userId = identity.subject;

    const item = await ctx.db
      .query("watched")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    return !!item;
  },
});

export const getUserWatched = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    const items = await ctx.db
      .query("watched")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return items;
  },
});

// Review mutations and queries
export const addReview = mutation({
  args: {
    movieId: v.number(),
    movieTitle: v.string(),
    rating: v.number(),
    reviewText: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const userId = identity.subject;

    // Check if review already exists for this user and movie
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    if (existing) {
      // Update existing review
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        reviewText: args.reviewText,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    // Create new review
    const id = await ctx.db.insert("reviews", {
      userId,
      movieId: args.movieId,
      movieTitle: args.movieTitle,
      rating: args.rating,
      reviewText: args.reviewText,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const getMovieReview = query({
  args: {
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;

    const review = await ctx.db
      .query("reviews")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    return review || null;
  },
});

export const deleteReview = mutation({
  args: {
    movieId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const userId = identity.subject;

    const review = await ctx.db
      .query("reviews")
      .withIndex("by_userId_movieId", (q) =>
        q.eq("userId", userId).eq("movieId", args.movieId)
      )
      .first();

    if (review) {
      await ctx.db.delete(review._id);
    }
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});
