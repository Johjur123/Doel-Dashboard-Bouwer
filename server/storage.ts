import { db } from "./db";
import { goals, logs, type Goal, type InsertGoal, type Log, type InsertLog } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  createLog(log: InsertLog): Promise<Log>;
  getLogs(goalId: number): Promise<Log[]>;
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
    return await db.select().from(logs).where(eq(logs.goalId, goalId)).orderBy(logs.createdAt);
  }

  async seed(): Promise<void> {
    const existing = await this.getGoals();
    if (existing.length > 0) return;

    const seedData: InsertGoal[] = [
      // Lifestyle
      { title: "Max wiet per week", category: "lifestyle", type: "counter", currentValue: 1, targetValue: 3, unit: "g", icon: "🌿", color: "bg-green-500" },
      { title: "Alcohol per week", category: "lifestyle", type: "counter", currentValue: 2, targetValue: 5, unit: "drinks", icon: "🍷", color: "bg-red-400" },
      { title: "Sport per week", category: "lifestyle", type: "counter", currentValue: 2, targetValue: 4, unit: "workouts", icon: "💪", color: "bg-blue-500" },
      { title: "Budget boodschappen", category: "lifestyle", type: "progress", currentValue: 250, targetValue: 400, unit: "€", icon: "🛒", color: "bg-orange-400" },

      // Savings
      { title: "Tokio Trip", category: "savings", type: "progress", currentValue: 1200, targetValue: 5000, unit: "€", icon: "🇯🇵", color: "bg-gradient-to-r from-pink-500 to-purple-500" },
      { title: "Canada + New York", category: "savings", type: "progress", currentValue: 3000, targetValue: 8000, unit: "€", icon: "🍁", color: "bg-gradient-to-r from-red-500 to-blue-500" },

      // Business
      {
        title: "Visibilita Locale",
        category: "business",
        type: "roadmap",
        currentValue: 3,
        targetValue: 8,
        icon: "💼",
        metadata: {
          steps: [
            { title: "Businessplan", completed: true },
            { title: "Branding", completed: true },
            { title: "Website", completed: true },
            { title: "Product", completed: false },
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
        metadata: {
          steps: [
            { title: "Businessplan", completed: true },
            { title: "Branding", completed: false },
            { title: "Website", completed: false },
            { title: "Product", completed: false },
            { title: "Social media", completed: false },
            { title: "Financiën + prijs", completed: false },
            { title: "Proefklant", completed: false },
            { title: "Eerste volwaardige klant", completed: false }
          ]
        }
      },

      // Casa
      { title: "Woonkamer", category: "casa", type: "room", currentValue: 80, targetValue: 100, icon: "🛋️", color: "bg-stone-500" },
      { title: "Keuken", category: "casa", type: "room", currentValue: 40, targetValue: 100, icon: "🍳", color: "bg-stone-400" },
      { title: "Tuin", category: "casa", type: "room", currentValue: 20, targetValue: 100, icon: "🌳", color: "bg-green-600" },

      // Milestones
      { title: "Samenwonen", category: "milestones", type: "boolean", currentValue: 1, targetValue: 1, icon: "🏠", color: "bg-teal-500" },
      { title: "Eerste huurder", category: "milestones", type: "boolean", currentValue: 0, targetValue: 1, icon: "🔑", color: "bg-yellow-500" },
      { title: "Italiaans leren", category: "milestones", type: "boolean", currentValue: 0, targetValue: 1, icon: "🇮🇹", color: "bg-green-500" },

      // Fun
      { title: "Dagen samen", category: "fun", type: "counter", currentValue: 1400, unit: "days", icon: "❤️", color: "bg-red-500" },
      { title: "Keer uit eten", category: "fun", type: "counter", currentValue: 42, unit: "times", icon: "🍽️", color: "bg-orange-500" },
    ];

    await db.insert(goals).values(seedData);
  }
}

export const storage = new DatabaseStorage();
