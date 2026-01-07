import { db } from "./db";
import { goals, logs, userProfiles, activities, goalNotes, milestonePhotos, periodHistory, ideaCategories, ideas, type Goal, type InsertGoal, type Log, type InsertLog, type UserProfile, type InsertUserProfile, type Activity, type InsertActivity, type GoalNote, type InsertGoalNote, type MilestonePhoto, type InsertMilestonePhoto, type PeriodHistory, type InsertPeriodHistory, type IdeaCategory, type InsertIdeaCategory, type Idea, type InsertIdea } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<void>;
  createLog(log: InsertLog): Promise<Log>;
  getLogs(goalId: number): Promise<Log[]>;
  getAllLogs(): Promise<Log[]>;
  getUsers(): Promise<UserProfile[]>;
  getUser(id: number): Promise<UserProfile | undefined>;
  updateUser(id: number, user: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(limit?: number): Promise<Activity[]>;
  createGoalNote(note: InsertGoalNote): Promise<GoalNote>;
  getGoalNotes(goalId: number): Promise<GoalNote[]>;
  deleteGoalNote(id: number): Promise<void>;
  createMilestonePhoto(photo: InsertMilestonePhoto): Promise<MilestonePhoto>;
  getMilestonePhotos(goalId: number): Promise<MilestonePhoto[]>;
  deleteMilestonePhoto(id: number): Promise<void>;
  createPeriodHistory(history: InsertPeriodHistory): Promise<PeriodHistory>;
  getPeriodHistory(goalId: number): Promise<PeriodHistory[]>;
  checkAndResetPeriods(): Promise<void>;
  getIdeaCategories(): Promise<IdeaCategory[]>;
  createIdeaCategory(category: InsertIdeaCategory): Promise<IdeaCategory>;
  updateIdeaCategory(id: number, category: Partial<InsertIdeaCategory>): Promise<IdeaCategory | undefined>;
  deleteIdeaCategory(id: number): Promise<void>;
  getIdeas(categoryId?: number): Promise<Idea[]>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea | undefined>;
  deleteIdea(id: number): Promise<void>;
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

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, update: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updated] = await db.update(goals).set(update).where(eq(goals.id, id)).returning();
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(logs).where(eq(logs.goalId, id));
    await db.delete(goalNotes).where(eq(goalNotes.goalId, id));
    await db.delete(milestonePhotos).where(eq(milestonePhotos.goalId, id));
    await db.delete(periodHistory).where(eq(periodHistory.goalId, id));
    await db.delete(activities).where(eq(activities.goalId, id));
    await db.delete(goals).where(eq(goals.id, id));
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
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getActivities(limit: number = 20): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }

  async createGoalNote(note: InsertGoalNote): Promise<GoalNote> {
    const [newNote] = await db.insert(goalNotes).values(note).returning();
    return newNote;
  }

  async getGoalNotes(goalId: number): Promise<GoalNote[]> {
    return await db.select().from(goalNotes).where(eq(goalNotes.goalId, goalId)).orderBy(desc(goalNotes.createdAt));
  }

  async deleteGoalNote(id: number): Promise<void> {
    await db.delete(goalNotes).where(eq(goalNotes.id, id));
  }

  async createMilestonePhoto(photo: InsertMilestonePhoto): Promise<MilestonePhoto> {
    const [newPhoto] = await db.insert(milestonePhotos).values(photo).returning();
    return newPhoto;
  }

  async getMilestonePhotos(goalId: number): Promise<MilestonePhoto[]> {
    return await db.select().from(milestonePhotos).where(eq(milestonePhotos.goalId, goalId)).orderBy(desc(milestonePhotos.createdAt));
  }

  async deleteMilestonePhoto(id: number): Promise<void> {
    await db.delete(milestonePhotos).where(eq(milestonePhotos.id, id));
  }

  async createPeriodHistory(history: InsertPeriodHistory): Promise<PeriodHistory> {
    const [newHistory] = await db.insert(periodHistory).values(history).returning();
    return newHistory;
  }

  async getPeriodHistory(goalId: number): Promise<PeriodHistory[]> {
    return await db.select().from(periodHistory).where(eq(periodHistory.goalId, goalId)).orderBy(desc(periodHistory.periodEnd));
  }

  async checkAndResetPeriods(): Promise<void> {
    const allGoals = await this.getGoals();
    const now = new Date();
    
    for (const goal of allGoals) {
      if (!goal.resetPeriod || goal.resetPeriod === "none") continue;
      if (!goal.periodStartDate) {
        await this.updateGoal(goal.id, { periodStartDate: now });
        continue;
      }

      const periodStart = new Date(goal.periodStartDate);
      let periodEnd: Date;
      let shouldReset = false;

      if (goal.resetPeriod === "weekly") {
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        shouldReset = now >= periodEnd;
      } else if (goal.resetPeriod === "monthly") {
        periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        shouldReset = now >= periodEnd;
      }

      if (shouldReset) {
        await this.createPeriodHistory({
          goalId: goal.id,
          periodType: goal.resetPeriod,
          periodStart: periodStart,
          periodEnd: periodEnd!,
          finalValue: goal.currentValue || 0,
          targetValue: goal.targetValue || null,
        });

        await this.updateGoal(goal.id, {
          currentValue: 0,
          periodStartDate: now,
        });
      }
    }
  }

  async getIdeaCategories(): Promise<IdeaCategory[]> {
    return await db.select().from(ideaCategories).orderBy(ideaCategories.id);
  }

  async createIdeaCategory(category: InsertIdeaCategory): Promise<IdeaCategory> {
    const [newCategory] = await db.insert(ideaCategories).values(category).returning();
    return newCategory;
  }

  async updateIdeaCategory(id: number, update: Partial<InsertIdeaCategory>): Promise<IdeaCategory | undefined> {
    const [updated] = await db.update(ideaCategories).set(update).where(eq(ideaCategories.id, id)).returning();
    return updated;
  }

  async deleteIdeaCategory(id: number): Promise<void> {
    await db.delete(ideas).where(eq(ideas.categoryId, id));
    await db.delete(ideaCategories).where(eq(ideaCategories.id, id));
  }

  async getIdeas(categoryId?: number): Promise<Idea[]> {
    if (categoryId) {
      return await db.select().from(ideas).where(eq(ideas.categoryId, categoryId)).orderBy(ideas.id);
    }
    return await db.select().from(ideas).orderBy(ideas.id);
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return newIdea;
  }

  async updateIdea(id: number, update: Partial<InsertIdea>): Promise<Idea | undefined> {
    const [updated] = await db.update(ideas).set(update).where(eq(ideas.id, id)).returning();
    return updated;
  }

  async deleteIdea(id: number): Promise<void> {
    await db.delete(ideas).where(eq(ideas.id, id));
  }

  async seed(): Promise<void> {
    const existingGoals = await this.getGoals();
    if (existingGoals.length > 0) return;

    const now = new Date();
    const seedGoals: InsertGoal[] = [
      { title: "Max wiet per week", category: "lifestyle", type: "counter", currentValue: 1, targetValue: 3, unit: "gram", icon: "🌿", color: "green", resetPeriod: "weekly", periodStartDate: now },
      { title: "Alcohol per week", category: "lifestyle", type: "counter", currentValue: 2, targetValue: 5, unit: "drankjes", icon: "🍷", color: "red", resetPeriod: "weekly", periodStartDate: now },
      { title: "Sport per week", category: "lifestyle", type: "counter", currentValue: 2, targetValue: 4, unit: "workouts", icon: "💪", color: "blue", resetPeriod: "weekly", periodStartDate: now },
      { title: "Gezond eten", category: "lifestyle", type: "counter", currentValue: 5, targetValue: 7, unit: "dagen", icon: "🥗", color: "green", resetPeriod: "weekly", periodStartDate: now },
      { title: "Budget boodschappen", category: "lifestyle", type: "progress", currentValue: 280, targetValue: 400, unit: "euro", icon: "🛒", color: "orange", resetPeriod: "monthly", periodStartDate: now },

      { title: "Tokio Trip", category: "savings", type: "progress", currentValue: 2400, targetValue: 5000, unit: "euro", icon: "🇯🇵", color: "pink", resetPeriod: "none", targetDate: new Date("2025-12-01") },
      { title: "Canada + New York", category: "savings", type: "progress", currentValue: 4500, targetValue: 8000, unit: "euro", icon: "🍁", color: "red", resetPeriod: "none", targetDate: new Date("2026-06-01") },
      { title: "Noodfonds", category: "savings", type: "progress", currentValue: 3000, targetValue: 10000, unit: "euro", icon: "🛡️", color: "blue", resetPeriod: "none" },

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
            { 
              title: "Businessplan", 
              completed: true, 
              substeps: [
                { title: "Marktonderzoek", completed: true },
                { title: "Doelgroep definiëren", completed: true },
                { title: "Concurrentieanalyse", completed: true },
                { title: "Financiële projecties", completed: true }
              ]
            },
            { 
              title: "Branding", 
              completed: true,
              substeps: [
                { title: "Logo ontwerp", completed: true },
                { title: "Kleurenpalet", completed: true },
                { title: "Huisstijl document", completed: true }
              ]
            },
            { 
              title: "Website", 
              completed: true,
              substeps: [
                { title: "Domein registreren", completed: true },
                { title: "Design mockups", completed: true },
                { title: "Development", completed: true },
                { title: "Content schrijven", completed: true },
                { title: "Live zetten", completed: true }
              ]
            },
            { 
              title: "Product", 
              completed: false,
              substeps: [
                { title: "Dienst definiëren", completed: false },
                { title: "Paketten samenstellen", completed: false },
                { title: "Testversie maken", completed: false }
              ]
            },
            { 
              title: "Social media", 
              completed: false,
              substeps: [
                { title: "Accounts aanmaken", completed: false },
                { title: "Contentstrategie", completed: false },
                { title: "Eerste posts", completed: false }
              ]
            },
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
            { 
              title: "Businessplan", 
              completed: true,
              substeps: [
                { title: "Import regelgeving", completed: true },
                { title: "Wijnregio's selecteren", completed: true },
                { title: "Kosten berekenen", completed: false }
              ]
            },
            { title: "Branding", completed: false },
            { title: "Website", completed: false },
            { 
              title: "Product", 
              completed: false, 
              substeps: [
                { title: "Contact wijnboeren", completed: true },
                { title: "Proeverij organiseren", completed: false },
                { title: "Eerste selectie maken", completed: false }
              ]
            },
            { title: "Social media", completed: false },
            { title: "Financiën + prijs", completed: false },
            { title: "Proefklant", completed: false },
            { title: "Eerste volwaardige klant", completed: false }
          ]
        }
      },

      { 
        title: "Woonkamer", 
        category: "casa", 
        type: "room", 
        currentValue: 4, 
        targetValue: 6, 
        icon: "🛋️", 
        color: "stone", 
        metadata: { 
          items: [
            { title: "Nieuwe bank kiezen", completed: true },
            { title: "Bank bestellen", completed: true },
            { title: "Schilderij ophangen", completed: true },
            { title: "Planten kopen", completed: true },
            { title: "Vloerkleed", completed: false },
            { title: "Gordijnen", completed: false }
          ] 
        } 
      },
      { 
        title: "Keuken", 
        category: "casa", 
        type: "room", 
        currentValue: 2, 
        targetValue: 5, 
        icon: "🍳", 
        color: "orange", 
        metadata: { 
          items: [
            { title: "Nieuwe kraan installeren", completed: true },
            { title: "Keukenblad schoonmaken", completed: true },
            { title: "Backsplash tegels", completed: false },
            { title: "Opbergruimte organiseren", completed: false },
            { title: "Verlichting upgraden", completed: false }
          ] 
        } 
      },
      { 
        title: "Tuin", 
        category: "casa", 
        type: "room", 
        currentValue: 2, 
        targetValue: 8, 
        icon: "🌳", 
        color: "green", 
        metadata: { 
          items: [
            { title: "Terras schoonmaken", completed: true },
            { title: "Onkruid wieden", completed: true },
            { title: "Nieuwe planten kopen", completed: false },
            { title: "Verlichting plaatsen", completed: false },
            { title: "Tuinmeubels kopen", completed: false },
            { title: "BBQ installeren", completed: false },
            { title: "Irrigatiesysteem", completed: false },
            { title: "Hek repareren", completed: false }
          ] 
        } 
      },
      { 
        title: "Zwembad", 
        category: "casa", 
        type: "room", 
        currentValue: 1, 
        targetValue: 5, 
        icon: "🏊", 
        color: "blue", 
        metadata: { 
          items: [
            { title: "Schoonmaken", completed: true },
            { title: "Filter controleren", completed: false },
            { title: "Chemicaliën kopen", completed: false },
            { title: "Pomp repareren", completed: false },
            { title: "Afdekzeil kopen", completed: false }
          ] 
        } 
      },
      { 
        title: "Slaapkamer", 
        category: "casa", 
        type: "room", 
        currentValue: 4, 
        targetValue: 5, 
        icon: "🛏️", 
        color: "purple", 
        metadata: { 
          items: [
            { title: "Nieuw bed gekocht", completed: true },
            { title: "Matras gekozen", completed: true },
            { title: "Gordijnen opgehangen", completed: true },
            { title: "Nachtkastjes geplaatst", completed: true },
            { title: "Decoratie toevoegen", completed: false }
          ] 
        } 
      },
      { 
        title: "Badkamer", 
        category: "casa", 
        type: "room", 
        currentValue: 2, 
        targetValue: 6, 
        icon: "🚿", 
        color: "teal", 
        metadata: { 
          items: [
            { title: "Nieuwe spiegel", completed: true },
            { title: "Handdoekhouder", completed: true },
            { title: "Opbergruimte", completed: false },
            { title: "Verlichting", completed: false },
            { title: "Tegels voegen", completed: false },
            { title: "Plantjes", completed: false }
          ] 
        } 
      },

      { title: "Samenwonen", category: "milestones", type: "boolean", currentValue: 1, targetValue: 1, icon: "🏠", color: "teal", unit: "September 2024" },
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
      { name: "Jij", avatar: "👨" },
      { name: "Vriendin", avatar: "👩" },
    ];

    await db.insert(userProfiles).values(seedUsers);
  }
}

export const storage = new DatabaseStorage();
