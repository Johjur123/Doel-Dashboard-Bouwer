import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
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
      
      // Auto-update goal current value based on log
      const goal = await storage.getGoal(input.goalId);
      if (goal) {
        let newValue = goal.currentValue || 0;
        // Simple logic: add value to current
        // For boolean/roadmap, value handling might differ, but for prototype this is fine
        newValue += input.value;
        await storage.updateGoal(goal.id, { currentValue: newValue });
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

  return httpServer;
}
