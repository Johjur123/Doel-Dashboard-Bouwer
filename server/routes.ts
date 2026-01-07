import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.seed();

  app.get(api.goals.list.path, async (req, res) => {
    const goals = await storage.getGoals();
    res.json(goals);
  });

  app.get(api.goals.get.path, async (req, res) => {
    const goal = await storage.getGoal(Number(req.params.id));
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  });

  app.patch(api.goals.update.path, async (req, res) => {
    try {
      const input = api.goals.update.input.parse(req.body);
      const updated = await storage.updateGoal(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "Goal not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(input);
      
      const goal = await storage.getGoal(input.goalId);
      if (goal) {
        let newValue = goal.currentValue || 0;
        newValue += input.value;
        await storage.updateGoal(goal.id, { currentValue: newValue });
        
        const users = await storage.getUsers();
        if (users.length > 0) {
          const user = users[0];
          const newXp = (user.xp || 0) + 10;
          await storage.updateUser(user.id, { xp: newXp });
          
          await storage.createActivity({
            userId: user.id,
            goalId: goal.id,
            action: "log",
            description: `${input.value > 0 ? "+" : ""}${input.value} ${goal.unit || ""} bij ${goal.title}`,
            xpEarned: 10,
          });
        }
      }

      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs(Number(req.params.goalId));
    res.json(logs);
  });

  app.get(api.logs.all.path, async (req, res) => {
    const logs = await storage.getAllLogs();
    res.json(logs);
  });

  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.patch(api.users.update.path, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const updated = await storage.updateUser(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.activity.list.path, async (req, res) => {
    const activities = await storage.getActivities(20);
    res.json(activities);
  });

  app.get(api.stats.get.path, async (req, res) => {
    const users = await storage.getUsers();
    const goals = await storage.getGoals();
    const logs = await storage.getAllLogs();
    
    const totalXp = users.reduce((sum, u) => sum + (u.xp || 0), 0);
    const streaks = users.map(u => u.currentStreak || 0);
    const longestStreaks = users.map(u => u.longestStreak || 0);
    const maxStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
    const longestStreak = longestStreaks.length > 0 ? Math.max(...longestStreaks) : 0;
    const goalsCompleted = goals.filter(g => 
      g.type === "boolean" && (g.currentValue || 0) >= (g.targetValue || 1)
    ).length;
    
    res.json({
      totalXp,
      currentStreak: maxStreak,
      longestStreak,
      goalsCompleted,
      totalLogs: logs.length,
    });
  });

  return httpServer;
}
