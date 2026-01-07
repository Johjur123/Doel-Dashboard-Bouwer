import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  currentValue: integer("current_value").default(0),
  targetValue: integer("target_value"),
  unit: text("unit"),
  icon: text("icon"),
  color: text("color"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  value: integer("value").notNull(),
  note: text("note"),
  itemTitle: text("item_title"),
  stepTitle: text("step_title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalId: integer("goal_id"),
  action: text("action").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type RoomItem = {
  title: string;
  completed: boolean;
  notes?: string;
};

export type RoadmapSubstep = {
  title: string;
  completed: boolean;
  notes?: string;
};

export type RoadmapStep = {
  title: string;
  completed: boolean;
  notes?: string;
  blocked?: boolean;
  substeps?: RoadmapSubstep[];
};

export type GoalMetadata = {
  steps?: RoadmapStep[];
  items?: RoomItem[];
};

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Goal = typeof goals.$inferSelect;
export type Log = typeof logs.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Activity = typeof activities.$inferSelect;
