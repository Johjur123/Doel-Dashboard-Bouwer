import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: date("last_active_date"),
  badges: jsonb("badges").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalId: integer("goal_id"),
  action: text("action").notNull(),
  description: text("description").notNull(),
  xpEarned: integer("xp_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true });
export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({ id: true, createdAt: true });

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Activity = typeof activityFeed.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivityFeedSchema>;

export interface RoadmapStep {
  title: string;
  completed: boolean;
  notes?: string;
  dueDate?: string;
  blocked?: boolean;
}

export interface RoomChecklist {
  items: { label: string; completed: boolean }[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Badge[] = [
  { id: 'first_log', title: 'Eerste Stap', description: 'Je eerste activiteit gelogd', icon: '🌱', rarity: 'common' },
  { id: 'week_streak', title: 'Week Warrior', description: '7 dagen op rij actief', icon: '🔥', rarity: 'rare' },
  { id: 'month_streak', title: 'Maand Meester', description: '30 dagen op rij actief', icon: '💎', rarity: 'epic' },
  { id: 'savings_goal', title: 'Spaar Kampioen', description: 'Eerste spaardoel bereikt', icon: '💰', rarity: 'rare' },
  { id: 'business_step', title: 'Entrepreneur', description: 'Eerste business stap voltooid', icon: '🚀', rarity: 'common' },
  { id: 'all_rooms', title: 'Huisbaas', description: 'Alle kamers 100% klaar', icon: '🏆', rarity: 'legendary' },
  { id: 'milestone_reached', title: 'Mijlpaal Master', description: 'Eerste mijlpaal bereikt', icon: '⭐', rarity: 'rare' },
  { id: 'level_5', title: 'Rising Star', description: 'Level 5 bereikt', icon: '🌟', rarity: 'common' },
  { id: 'level_10', title: 'Veteraan', description: 'Level 10 bereikt', icon: '🎖️', rarity: 'rare' },
  { id: 'together_365', title: 'Jaar Samen', description: '365 dagen samen geteld', icon: '💕', rarity: 'epic' },
];

export function calculateLevel(xp: number): { level: number; currentXp: number; xpForNext: number; progress: number } {
  const baseXp = 100;
  const multiplier = 1.5;
  let level = 1;
  let totalXpNeeded = baseXp;
  let xpForPreviousLevels = 0;

  while (xp >= totalXpNeeded) {
    xpForPreviousLevels = totalXpNeeded;
    level++;
    totalXpNeeded += Math.floor(baseXp * Math.pow(multiplier, level - 1));
  }

  const currentXp = xp - xpForPreviousLevels;
  const xpForNext = totalXpNeeded - xpForPreviousLevels;
  const progress = (currentXp / xpForNext) * 100;

  return { level, currentXp, xpForNext, progress };
}
