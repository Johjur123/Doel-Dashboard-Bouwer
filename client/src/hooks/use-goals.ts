import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertGoal, InsertLog, InsertUserProfile, Activity, InsertGoalNote, InsertMilestonePhoto, GoalNote, MilestonePhoto } from "@shared/schema";

export function useGoals() {
  return useQuery({
    queryKey: [api.goals.list.path],
    queryFn: async () => {
      const res = await fetch(api.goals.list.path);
      if (!res.ok) throw new Error("Failed to fetch goals");
      return api.goals.list.responses[200].parse(await res.json());
    },
  });
}

export function useGoal(id: number) {
  return useQuery({
    queryKey: [api.goals.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.goals.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch goal");
      return api.goals.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertGoal>) => {
      const url = buildUrl(api.goals.update.path, { id });
      const res = await fetch(url, {
        method: api.goals.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return api.goals.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
    },
  });
}

export function useLogs(goalId: number) {
  return useQuery({
    queryKey: [api.logs.list.path, goalId],
    queryFn: async () => {
      const url = buildUrl(api.logs.list.path, { goalId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
    enabled: !!goalId,
  });
}

export function useAllLogs() {
  return useQuery({
    queryKey: [api.logs.all.path],
    queryFn: async () => {
      const res = await fetch(api.logs.all.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.all.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertLog) => {
      const res = await fetch(api.logs.create.path, {
        method: api.logs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create log");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path, variables.goalId] });
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.logs.all.path] });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path);
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertUserProfile>) => {
      const url = buildUrl(api.users.update.path, { id });
      const res = await fetch(url, {
        method: api.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return api.users.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}

export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: [api.activity.list.path],
    queryFn: async () => {
      const res = await fetch(api.activity.list.path);
      if (!res.ok) throw new Error("Failed to fetch activities");
      return api.activity.list.responses[200].parse(await res.json());
    },
  });
}

export function useGoalNotes(goalId: number) {
  return useQuery<GoalNote[]>({
    queryKey: [api.notes.list.path, goalId],
    queryFn: async () => {
      const url = buildUrl(api.notes.list.path, { goalId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    enabled: !!goalId,
  });
}

export function useCreateGoalNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGoalNote) => {
      const url = buildUrl(api.notes.create.path, { goalId: data.goalId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.notes.list.path, variables.goalId] });
    },
  });
}

export function useDeleteGoalNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, goalId }: { id: number; goalId: number }) => {
      const url = buildUrl(api.notes.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.notes.list.path, variables.goalId] });
    },
  });
}

export function useMilestonePhotos(goalId: number) {
  return useQuery<MilestonePhoto[]>({
    queryKey: [api.photos.list.path, goalId],
    queryFn: async () => {
      const url = buildUrl(api.photos.list.path, { goalId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch photos");
      return res.json();
    },
    enabled: !!goalId,
  });
}

export function useCreateMilestonePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMilestonePhoto) => {
      const url = buildUrl(api.photos.create.path, { goalId: data.goalId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create photo");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.photos.list.path, variables.goalId] });
    },
  });
}

export function useDeleteMilestonePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, goalId }: { id: number; goalId: number }) => {
      const url = buildUrl(api.photos.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete photo");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.photos.list.path, variables.goalId] });
    },
  });
}
