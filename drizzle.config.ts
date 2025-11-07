// Export a plain config object to avoid type errors during TS checks when drizzle-kit types change.
// drizzle-kit CLI will consume this file at runtime.
export default {
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
};
