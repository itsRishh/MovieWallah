import { username } from "better-auth/plugins";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  watchlist: defineTable({
    userId: v.string(),
    userName: v.string(),
    name: v.string(),
    movieId: v.number(),
    title: v.string(),
    poster_path: v.optional(v.string()),
    vote_average: v.number(),
    release_date: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_movieId", ["userId", "movieId"]),
  watched: defineTable({
    userId: v.string(),
    userName: v.string(),
    name: v.string(),
    movieId: v.number(),
    title: v.string(),
    poster_path: v.optional(v.string()),
    vote_average: v.number(),
    release_date: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_movieId", ["userId", "movieId"]),
  reviews: defineTable({
    userId: v.string(),
    movieId: v.number(),
    movieTitle: v.string(),
    rating: v.number(),
    reviewText: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId_movieId", ["userId", "movieId"])
    .index("by_movieId", ["movieId"])
    .index("by_userId", ["userId"]),
});
