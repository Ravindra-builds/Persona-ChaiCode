import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),

  mentor: varchar("mentor", { length: 50 })
    .notNull()
    .unique(),

  version: integer("version").default(1),

  content: text("content").notNull(),

  isActive: boolean("is_active").default(true),

  updatedAt: timestamp("updated_at").defaultNow(),
});