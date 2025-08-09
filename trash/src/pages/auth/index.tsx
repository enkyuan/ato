import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  
  files: defineTable({
    path: v.string(),
    url: v.string(),
    userId: v.id("users"),
  }).index("by_path", ["path"]),
});