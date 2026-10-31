import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leadStatuses = [
  "queued",
  "researching",
  "scoring",
  "done",
  "failed",
] as const;

export const leadTiers = ["Hot", "Warm", "Cold"] as const;

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  website: text("website").notNull(),
  contactName: text("contact_name").notNull(),
  title: text("title").notNull(),
  email: text("email").notNull(),
  status: text("status", { enum: leadStatuses }).notNull().default("queued"),
  summary: text("summary"),
  industry: text("industry"),
  sizeSignal: text("size_signal"),
  score: integer("score"),
  tier: text("tier", { enum: leadTiers }),
  reasons: text("reasons", { mode: "json" }).$type<string[]>(),
  message: text("message"),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  error: text("error"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
