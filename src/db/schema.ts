import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Clerk handles user authentication, this table is for app-specific user data
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // Clerk user ID
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
