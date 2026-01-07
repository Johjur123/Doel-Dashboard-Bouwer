import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'lifestyle', 'savings', 'business', 'casa', 'milestones', 'fun'
  type: text("type").notNull(), // 'counter', 'progress', 'roadmap', 'room', 'boolean'
  currentValue: integer("current_value").default(0),
  targetValue: integer("target_value"),
  unit: text("unit"),
  icon: text("icon"), // Emoji or icon name
  color: text("color"), // CSS color class or hex
  metadata: jsonb("metadata"), // For roadmap steps, room checklists, or specific config
  createdAt: timestamp("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  value: integer("value").notNull(), // Change amount (+1, -1, or specific amount)
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// Helper types for specific metadata structures
export interface RoadmapStep {
  title: string;
  completed: boolean;
  notes?: string;
}

export interface RoomChecklist {
  items: { label: string; completed: boolean }[];
}
