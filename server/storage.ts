import { db } from "./db";
import { goals, logs, userProfiles, activityFeed, type Goal, type InsertGoal, type Log, type InsertLog, type UserProfile, type InsertUserProfile, type Activity, type InsertActivity } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  createLog(log: InsertLog): Promise<Log>;
  getLogs(goalId: number): Promise<Log[]>;
  getAllLogs(): Promise<Log[]>;
  getUsers(): Promise<UserProfile[]>;
  getUser(id: number): Promise<UserProfile | undefined>;
  updateUser(id: number, user: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(limit?: number): Promise<Activity[]>;
  seed(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals).orderBy(goals.id);
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async updateGoal(id: number, update: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updated] = await db.update(goals).set(update).where(eq(goals.id, id)).returning();
    return updated;
  }

  async createLog(log: InsertLog): Promise<Log> {
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }

  async getLogs(goalId: number): Promise<Log[]> {
    return await db.select().from(logs).where(eq(logs.goalId, goalId)).orderBy(desc(logs.createdAt));
  }

  async getAllLogs(): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.createdAt)).limit(50);
  }

  async getUsers(): Promise<UserProfile[]> {
    return await db.select().from(userProfiles).orderBy(userProfiles.id);
  }

  async getUser(id: number): Promise<UserProfile | undefined> {
    const [user] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return user;
  }

  async updateUser(id: number, update: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db.update(userProfiles).set(update).where(eq(userProfiles.id, id)).returning();
    return updated;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activityFeed).values(activity).returning();
    return newActivity;
  }

  async getActivities(limit: number = 20): Promise<Activity[]> {
    return await db.select().from(activityFeed).orderBy(desc(activityFeed.createdAt)).limit(limit);
  }

  async seed(): Promise<void> {
    const existingGoals = await this.getGoals();
    if (existingGoals.length > 0) return;

    const seedGoals: InsertGoal[] = [
      { title: "Max wiet per week", category: "lifestyle", type: "counter", currentValue: 1, targetValue: 3, unit: "gram", icon: "🌿", color: "green" },
      { title: "Alcohol per week", category: "lifestyle", type: "counter", currentValue: 2, targetValue: 5, unit: "drankjes", icon: "🍷", color: "red" },
      { title: "Sport per week", category: "lifestyle", type: "counter", currentValue: 2, targetValue: 4, unit: "workouts", icon: "💪", color: "blue" },
      { title: "Gezond eten", category: "lifestyle", type: "counter", currentValue: 5, targetValue: 7, unit: "dagen", icon: "🥗", color: "green" },
      { title: "Budget boodschappen", category: "lifestyle", type: "progress", currentValue: 280, targetValue: 400, unit: "euro", icon: "🛒", color: "orange" },

      { title: "Tokio Trip", category: "savings", type: "progress", currentValue: 2400, targetValue: 5000, unit: "euro", icon: "🇯🇵", color: "pink" },
      { title: "Canada + New York", category: "savings", type: "progress", currentValue: 4500, targetValue: 8000, unit: "euro", icon: "🍁", color: "red" },
      { title: "Noodfonds", category: "savings", type: "progress", currentValue: 3000, targetValue: 10000, unit: "euro", icon: "🛡️", color: "blue" },

      {
        title: "Visibilita Locale",
        category: "business",
        type: "roadmap",
        currentValue: 3,
        targetValue: 8,
        icon: "💼",
        color: "blue",
        metadata: {
          steps: [
            { title: "Businessplan", completed: true, notes: "Afgerond in december" },
            { title: "Branding", completed: true, notes: "Logo en kleuren gekozen" },
            { title: "Website", completed: true, notes: "Live op visibilitalocale.com" },
            { title: "Product", completed: false, notes: "Eerste dienst definiëren" },
            { title: "Social media", completed: false },
            { title: "Financiën + prijs", completed: false },
            { title: "Proefklant", completed: false },
            { title: "Eerste volwaardige klant", completed: false }
          ]
        }
      },
      {
        title: "Wine Import",
        category: "business",
        type: "roadmap",
        currentValue: 1,
        targetValue: 8,
        icon: "🍇",
        color: "purple",
        metadata: {
          steps: [
            { title: "Businessplan", completed: true },
            { title: "Branding", completed: false },
            { title: "Website", completed: false },
            { title: "Product", completed: false, notes: "Contact met wijnboeren in Piemonte" },
            { title: "Social media", completed: false },
            { title: "Financiën + prijs", completed: false },
            { title: "Proefklant", completed: false },
            { title: "Eerste volwaardige klant", completed: false }
          ]
        }
      },

      { title: "Woonkamer", category: "casa", type: "room", currentValue: 85, targetValue: 100, icon: "🛋️", color: "stone", metadata: { items: [{ label: "Nieuwe bank", completed: true }, { label: "Schilderij ophangen", completed: true }, { label: "Planten", completed: false }] } },
      { title: "Keuken", category: "casa", type: "room", currentValue: 60, targetValue: 100, icon: "🍳", color: "orange", metadata: { items: [{ label: "Nieuwe kraan", completed: true }, { label: "Backsplash", completed: false }, { label: "Opbergruimte", completed: false }] } },
      { title: "Tuin", category: "casa", type: "room", currentValue: 30, targetValue: 100, icon: "🌳", color: "green", metadata: { items: [{ label: "Terras aanleggen", completed: true }, { label: "Planten", completed: false }, { label: "Verlichting", completed: false }, { label: "Tuinmeubels", completed: false }] } },
      { title: "Zwembad", category: "casa", type: "room", currentValue: 20, targetValue: 100, icon: "🏊", color: "blue", metadata: { items: [{ label: "Schoonmaken", completed: true }, { label: "Filter systeem", completed: false }, { label: "Verwarming", completed: false }] } },
      { title: "Slaapkamer", category: "casa", type: "room", currentValue: 90, targetValue: 100, icon: "🛏️", color: "purple", metadata: { items: [{ label: "Nieuw bed", completed: true }, { label: "Gordijnen", completed: true }, { label: "Nachtkastjes", completed: false }] } },
      { title: "Badkamer", category: "casa", type: "room", currentValue: 45, targetValue: 100, icon: "🚿", color: "teal", metadata: { items: [{ label: "Nieuwe spiegel", completed: true }, { label: "Opbergruimte", completed: false }, { label: "Verlichting", completed: false }] } },

      { title: "Samenwonen", category: "milestones", type: "boolean", currentValue: 1, targetValue: 1, icon: "🏠", color: "teal", unit: "Gelukt in september 2024" },
      { title: "Eerste huurder", category: "milestones", type: "boolean", currentValue: 0, targetValue: 1, icon: "🔑", color: "yellow" },
      { title: "Eerste betaalde offerte", category: "milestones", type: "boolean", currentValue: 0, targetValue: 1, icon: "📝", color: "green" },
      { title: "Italiaans B1 niveau", category: "milestones", type: "boolean", currentValue: 0, targetValue: 1, icon: "🇮🇹", color: "green" },
      { title: "Josefien afronden", category: "milestones", type: "boolean", currentValue: 0, targetValue: 1, icon: "🎓", color: "blue" },

      { title: "Dagen samen", category: "fun", type: "counter", currentValue: 1456, unit: "dagen", icon: "❤️", color: "red" },
      { title: "Keer uit eten", category: "fun", type: "counter", currentValue: 47, unit: "keer", icon: "🍽️", color: "orange" },
      { title: "Dagen in Italië", category: "fun", type: "counter", currentValue: 89, unit: "dagen", icon: "🇮🇹", color: "green" },
      { title: "Italiaans lessen", category: "fun", type: "counter", currentValue: 23, unit: "lessen", icon: "📚", color: "blue" },
    ];

    await db.insert(goals).values(seedGoals);

    const seedUsers: InsertUserProfile[] = [
      { name: "Jij", avatar: "👨", xp: 1250, level: 5, currentStreak: 12, longestStreak: 28, badges: ['first_log', 'week_streak', 'business_step'] },
      { name: "Vriendin", avatar: "👩", xp: 980, level: 4, currentStreak: 8, longestStreak: 21, badges: ['first_log', 'week_streak'] },
    ];

    await db.insert(userProfiles).values(seedUsers);

    const seedActivities: InsertActivity[] = [
      { userId: 1, goalId: 3, action: "log", description: "Workout gelogd", xpEarned: 15 },
      { userId: 2, goalId: 1, action: "log", description: "Sparen bijgewerkt", xpEarned: 10 },
      { userId: 1, goalId: 5, action: "step_complete", description: "Website stap voltooid", xpEarned: 50 },
    ];

    await db.insert(activityFeed).values(seedActivities);
  }
}

export const storage = new DatabaseStorage();
