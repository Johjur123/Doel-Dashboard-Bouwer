import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { IdeaCategory, InsertIdeaCategory, Idea, InsertIdea } from "@shared/schema";

export function useIdeaCategories() {
  return useQuery<IdeaCategory[]>({
    queryKey: ["/api/idea-categories"],
  });
}

export function useIdeas(categoryId?: number) {
  return useQuery<Idea[]>({
    queryKey: categoryId ? ["/api/idea-categories", categoryId, "ideas"] : ["/api/ideas"],
  });
}

export function useCreateIdeaCategory() {
  return useMutation({
    mutationFn: async (data: InsertIdeaCategory) => {
      const res = await apiRequest("POST", "/api/idea-categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/idea-categories"] });
    },
  });
}

export function useUpdateIdeaCategory() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertIdeaCategory> }) => {
      const res = await apiRequest("PATCH", `/api/idea-categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/idea-categories"] });
    },
  });
}

export function useDeleteIdeaCategory() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/idea-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/idea-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
  });
}

export function useCreateIdea() {
  return useMutation({
    mutationFn: async (data: InsertIdea) => {
      const res = await apiRequest("POST", "/api/ideas", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/idea-categories", variables.categoryId, "ideas"] });
    },
  });
}

export function useUpdateIdea() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertIdea> }) => {
      const res = await apiRequest("PATCH", `/api/ideas/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/idea-categories"] });
    },
  });
}

export function useDeleteIdea() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ideas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/idea-categories"] });
    },
  });
}
