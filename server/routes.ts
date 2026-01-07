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
          
          await storage.createActivity({
            userId: user.id,
            goalId: goal.id,
            action: "log",
            description: `${input.value > 0 ? "+" : ""}${input.value} ${goal.unit || ""} bij ${goal.title}`,
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
    const goals = await storage.getGoals();
    
    const goalsCompleted = goals.filter(g => 
      g.type === "boolean" && (g.currentValue || 0) >= (g.targetValue || 1)
    ).length;
    
    let totalItems = 0;
    let completedItems = 0;
    
    goals.forEach(g => {
      const metadata = g.metadata as any;
      if (g.type === "room" && metadata?.items) {
        totalItems += metadata.items.length;
        completedItems += metadata.items.filter((i: any) => i.completed).length;
      }
      if (g.type === "roadmap" && metadata?.steps) {
        metadata.steps.forEach((step: any) => {
          totalItems += 1;
          if (step.completed) completedItems += 1;
          if (step.substeps) {
            totalItems += step.substeps.length;
            completedItems += step.substeps.filter((s: any) => s.completed).length;
          }
        });
      }
    });
    
    res.json({
      goalsCompleted,
      totalItems,
      completedItems,
    });
  });

  app.get(api.notes.list.path, async (req, res) => {
    const notes = await storage.getGoalNotes(Number(req.params.goalId));
    res.json(notes);
  });

  app.post(api.notes.create.path, async (req, res) => {
    try {
      const input = api.notes.create.input.parse({
        ...req.body,
        goalId: Number(req.params.goalId),
      });
      const note = await storage.createGoalNote(input);
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.notes.delete.path, async (req, res) => {
    await storage.deleteGoalNote(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.photos.list.path, async (req, res) => {
    const photos = await storage.getMilestonePhotos(Number(req.params.goalId));
    res.json(photos);
  });

  app.post(api.photos.create.path, async (req, res) => {
    try {
      const input = api.photos.create.input.parse({
        ...req.body,
        goalId: Number(req.params.goalId),
      });
      const photo = await storage.createMilestonePhoto(input);
      res.status(201).json(photo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.photos.delete.path, async (req, res) => {
    await storage.deleteMilestonePhoto(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
