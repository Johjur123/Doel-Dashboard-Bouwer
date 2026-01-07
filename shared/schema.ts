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
  resetPeriod: text("reset_period").default("none"),
  periodStartDate: timestamp("period_start_date"),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const periodHistory = pgTable("period_history", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  periodType: text("period_type").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  finalValue: integer("final_value").notNull(),
  targetValue: integer("target_value"),
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

export const goalNotes = pgTable("goal_notes", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestonePhotos = pgTable("milestone_photos", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
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
export const insertGoalNoteSchema = createInsertSchema(goalNotes).omit({ id: true, createdAt: true });
export const insertMilestonePhotoSchema = createInsertSchema(milestonePhotos).omit({ id: true, createdAt: true });
export const insertPeriodHistorySchema = createInsertSchema(periodHistory).omit({ id: true, createdAt: true });

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertGoalNote = z.infer<typeof insertGoalNoteSchema>;
export type InsertMilestonePhoto = z.infer<typeof insertMilestonePhotoSchema>;
export type InsertPeriodHistory = z.infer<typeof insertPeriodHistorySchema>;

export type Goal = typeof goals.$inferSelect;
export type Log = typeof logs.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type GoalNote = typeof goalNotes.$inferSelect;
export type MilestonePhoto = typeof milestonePhotos.$inferSelect;
export type PeriodHistory = typeof periodHistory.$inferSelect;
