# Goal Dashboard

## Overview

A shared goal-tracking dashboard designed for couples to collaboratively monitor their goals, track KPIs, log progress, and stay motivated through gamification elements inspired by Habitica, Duolingo, and Apple design patterns. The dashboard organizes goals into categories (Lifestyle, Sparen/Savings, Business, Casa Hörnig, Mijlpalen/Milestones, Fun) with features for subdoels, progress logging, and visual celebrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions, confetti celebrations, and micro-interactions
- **Typography**: DM Sans (body) and Outfit (display) fonts

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Validation**: drizzle-zod for automatic schema-to-Zod type generation
- **Migrations**: Drizzle Kit for database migrations (`npm run db:push`)

### Key Data Models
- **Goals**: Track progress with currentValue/targetValue, categorized by type (lifestyle, savings, business, casa, milestones, fun)
- **Logs**: Record individual progress entries linked to goals
- **UserProfiles**: Store user information and avatars
- **Activities**: Activity feed for tracking actions across the dashboard

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components including shadcn/ui
    hooks/        # Custom React hooks for data fetching
    pages/        # Page components
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### UI/UX Libraries
- **Radix UI**: Headless component primitives (dialogs, dropdowns, tooltips, etc.)
- **Framer Motion**: Animation library for transitions and celebrations
- **Recharts**: Data visualization for goal history and progress charts
- **Lucide React**: Icon library
- **date-fns**: Date formatting with Dutch locale support

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database migration tooling