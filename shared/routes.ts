import { z } from 'zod';
import { insertGoalSchema, insertLogSchema, insertUserProfileSchema, insertGoalNoteSchema, insertMilestonePhotoSchema, goals, logs, userProfiles, activities, goalNotes, milestonePhotos, periodHistory } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  goals: {
    list: {
      method: 'GET' as const,
      path: '/api/goals',
      responses: {
        200: z.array(z.custom<typeof goals.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/goals/:id',
      responses: {
        200: z.custom<typeof goals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/goals',
      input: insertGoalSchema,
      responses: {
        201: z.custom<typeof goals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/goals/:id',
      input: insertGoalSchema.partial(),
      responses: {
        200: z.custom<typeof goals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/goals/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  logs: {
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: {
        201: z.custom<typeof logs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/logs/:goalId',
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    all: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof userProfiles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id',
      input: insertUserProfileSchema.partial(),
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  activity: {
    list: {
      method: 'GET' as const,
      path: '/api/activity',
      responses: {
        200: z.array(z.custom<typeof activities.$inferSelect>()),
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          goalsCompleted: z.number(),
          totalItems: z.number(),
          completedItems: z.number(),
        }),
      },
    },
  },
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/goals/:goalId/notes',
      responses: {
        200: z.array(z.custom<typeof goalNotes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/goals/:goalId/notes',
      input: insertGoalNoteSchema,
      responses: {
        201: z.custom<typeof goalNotes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/notes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  photos: {
    list: {
      method: 'GET' as const,
      path: '/api/goals/:goalId/photos',
      responses: {
        200: z.array(z.custom<typeof milestonePhotos.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/goals/:goalId/photos',
      input: insertMilestonePhotoSchema,
      responses: {
        201: z.custom<typeof milestonePhotos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/photos/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  periodHistory: {
    list: {
      method: 'GET' as const,
      path: '/api/goals/:goalId/history',
      responses: {
        200: z.array(z.custom<typeof periodHistory.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
