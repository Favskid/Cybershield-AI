import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const riskLevelEnum = pgEnum("risk_level", ["LOW", "MEDIUM", "HIGH"]);
export const threatStatusEnum = pgEnum("threat_status", ["PENDING", "REVIEWED", "RESOLVED"]);

export const threatsTable = pgTable("threat_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  link: text("link"),
  imageUrl: text("image_url"),
  aiAnalysis: text("ai_analysis").notNull().default(""),
  riskLevel: riskLevelEnum("risk_level").notNull().default("LOW"),
  status: threatStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertThreatSchema = createInsertSchema(threatsTable).omit({ id: true, createdAt: true });
export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type Threat = typeof threatsTable.$inferSelect;
