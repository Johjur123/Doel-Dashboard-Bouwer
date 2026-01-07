# Goal Dashboard - Technische Documentatie

## Inhoudsopgave
1. [Overzicht](#overzicht)
2. [Technische Architectuur](#technische-architectuur)
3. [Database Schema](#database-schema)
4. [Functionaliteiten](#functionaliteiten)
5. [Frontend Componenten](#frontend-componenten)
6. [API Endpoints](#api-endpoints)
7. [Styling & Theming](#styling--theming)

---

## Overzicht

Het Goal Dashboard is een gedeelde goal-tracking applicatie ontworpen voor koppels. De app combineert elementen van Habitica (gamification), Duolingo (motivatie) en Apple (design) om een moderne, gebruiksvriendelijke ervaring te creëren.

### Belangrijkste Kenmerken
- Doelen organiseren in 6 categorieën
- Voortgang bijhouden met visuele feedback
- Activiteitenfeed voor gezamenlijk overzicht
- Spaarprognoses en maandoverzichten
- Ideeënbus voor het verzamelen van plannen
- Licht/donker thema ondersteuning
- Confetti-vieringen bij mijlpalen

---

## Technische Architectuur

### Frontend Stack
| Technologie | Doel |
|-------------|------|
| **React 18** | UI Framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **Wouter** | Lightweight routing |
| **TanStack Query** | Server state management & caching |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | UI componenten (Radix UI basis) |
| **Framer Motion** | Animaties & transities |
| **Recharts** | Data visualisatie |

### Backend Stack
| Technologie | Doel |
|-------------|------|
| **Node.js** | Runtime |
| **Express.js** | Web framework |
| **TypeScript** | Type-safe development |
| **Drizzle ORM** | Database queries |
| **PostgreSQL** | Database |
| **Zod** | Schema validatie |

### Project Structuur
```
project/
├── client/                 # Frontend applicatie
│   └── src/
│       ├── components/     # React componenten
│       │   └── ui/         # shadcn/ui componenten
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Pagina componenten
│       └── lib/            # Utilities
├── server/                 # Backend applicatie
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operaties
│   └── db.ts               # Database connectie
├── shared/                 # Gedeelde code
│   ├── schema.ts           # Database schema
│   └── routes.ts           # API route definities
└── docs/                   # Documentatie
```

---

## Database Schema

### Goals (Doelen)
De centrale tabel voor alle doelen.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| title | text | Naam van het doel |
| category | text | Categorie (lifestyle, savings, business, casa, milestones, fun) |
| type | text | Type doel (counter, progress, boolean, roadmap, room) |
| currentValue | integer | Huidige waarde |
| targetValue | integer | Doelwaarde |
| unit | text | Eenheid (euro, gram, dagen, etc.) |
| icon | text | Emoji of icon |
| color | text | Kleurcode |
| metadata | jsonb | Extra data (stappen, items, etc.) |
| resetPeriod | text | Reset periode (none, weekly, monthly) |
| periodStartDate | timestamp | Start van huidige periode |
| targetDate | timestamp | Streefdatum |
| createdAt | timestamp | Aanmaakdatum |

### Logs (Voortgangs Logs)
Registreert individuele voortgang updates.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| goalId | integer | Gekoppeld doel |
| value | integer | Waarde verandering (+1, -1, etc.) |
| note | text | Optionele notitie |
| itemTitle | text | Item titel (voor room goals) |
| stepTitle | text | Stap titel (voor roadmap goals) |
| createdAt | timestamp | Datum/tijd |

### User Profiles (Gebruikersprofielen)
Profielen voor de twee partners.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| name | text | Naam |
| avatar | text | Avatar URL/data |
| createdAt | timestamp | Aanmaakdatum |

### Activities (Activiteitenfeed)
Chronologisch overzicht van alle acties.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| userId | integer | Gebruiker die actie uitvoerde |
| goalId | integer | Gerelateerd doel |
| action | text | Type actie |
| description | text | Beschrijving |
| createdAt | timestamp | Datum/tijd |

### Goal Notes (Doel Notities)
Notities gekoppeld aan specifieke doelen.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| goalId | integer | Gekoppeld doel |
| userId | integer | Auteur |
| content | text | Notitie inhoud |
| createdAt | timestamp | Datum/tijd |

### Milestone Photos (Mijlpaal Foto's)
Foto's voor visuele herinneringen bij mijlpalen.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| goalId | integer | Gekoppeld doel |
| url | text | Foto URL |
| caption | text | Bijschrift |
| createdAt | timestamp | Datum/tijd |

### Period History (Periode Geschiedenis)
Historische data voor periodieke doelen.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| goalId | integer | Gekoppeld doel |
| periodType | text | Type periode |
| periodStart | timestamp | Start periode |
| periodEnd | timestamp | Einde periode |
| finalValue | integer | Eindwaarde |
| targetValue | integer | Doelwaarde |

### Idea Categories (Idee Categorieën)
Categorieën voor de ideeënbus.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| name | text | Categorie naam |
| icon | text | Icon |
| color | text | Kleur |
| createdAt | timestamp | Aanmaakdatum |

### Ideas (Ideeën)
Individuele ideeën binnen categorieën.

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | serial | Primary key |
| categoryId | integer | Gekoppelde categorie |
| title | text | Idee titel |
| completed | boolean | Afgevinkt status |
| createdAt | timestamp | Aanmaakdatum |

---

## Functionaliteiten

### 1. Doelen Beheer

#### Doel Types
| Type | Beschrijving | Voorbeeld |
|------|--------------|-----------|
| **counter** | Teller met +/- knoppen | "Max wiet per week" (0-3 gram) |
| **progress** | Voortgangsbalk naar target | "Tokio Trip" (2400/5000 euro) |
| **boolean** | Aan/uit toggle | "Eerste date gehad" |
| **roadmap** | Stappen met substappen | "Visibilita Locale" (businessplan) |
| **room** | Checklist items | "Slaapkamer" (meubels, decoratie) |

#### Categorieën
1. **Lifestyle** - Gezondheid en gewoontes
2. **Sparen** - Financiële doelen en trips
3. **Business** - Werk en onderneming
4. **Casa Hörnig** - Huis en inrichting
5. **Mijlpalen** - Belangrijke momenten samen
6. **Fun** - Leuke activiteiten

#### Reset Periodes
- **none**: Geen reset, voortgang blijft
- **weekly**: Reset elke week (bijv. sport per week)
- **monthly**: Reset elke maand (bijv. budget boodschappen)

### 2. Voortgang Tracking

- **Quick Log**: Snelle +/- knoppen per doel
- **Detail Log**: Met notities en context
- **Visuele Feedback**: Progress bars en percentages
- **Confetti**: Automatische viering bij 100%

### 3. Dashboard Widgets

| Widget | Functie |
|--------|---------|
| **Hero Sectie** | Statistieken (dagen samen, mijlpalen, actieve doelen) |
| **Spaarprognose** | Wanneer spaardoelen bereikt worden |
| **Recente Activiteit** | Laatste acties van beide partners |
| **Maandoverzicht** | Samenvatting afgelopen 30 dagen |
| **Herinneringen** | Tijdgebonden notificaties |
| **Ideeënbus** | Quick-add voor ideeën |

### 4. Ideeënbus

Een "brievenbus" voor het verzamelen van ideeën:
- Categorieën aanmaken (Restaurants Rotterdam, Samen doen, etc.)
- Snel ideeën toevoegen
- Afvinken wanneer gedaan
- Overzicht op aparte pagina

### 5. Visuele Vieringen

Bij het behalen van doelen:
- **Confetti Burst**: Standaard viering
- **Stars**: Sterren animatie
- **Fireworks**: Vuurwerk effect

---

## Frontend Componenten

### Pagina's
| Component | Route | Beschrijving |
|-----------|-------|--------------|
| `Home.tsx` | `/` | Homepage met dashboard |
| `Dashboard.tsx` | `/goals/:category` | Categorie detail pagina |
| `Ideas.tsx` | `/ideas` | Ideeënbus beheer |

### Belangrijke Componenten
| Component | Functie |
|-----------|---------|
| `GoalCard.tsx` | Individuele doel weergave |
| `GoalDetailSheet.tsx` | Doel detail/bewerk sheet |
| `CreateGoalDialog.tsx` | Nieuw doel aanmaken |
| `ActivityFeed.tsx` | Activiteiten overzicht |
| `SavingsForecast.tsx` | Spaarprognose berekening |
| `MonthlyReport.tsx` | Maandelijkse statistieken |
| `Reminders.tsx` | Herinneringen widget |
| `ProgressChart.tsx` | Voortgang grafiek (Recharts) |
| `Confetti.tsx` | Viering animaties |
| `IdeasBox.tsx` | Ideeënbus widget |
| `ThemeToggle.tsx` | Licht/donker switcher |

### Custom Hooks
| Hook | Functie |
|------|---------|
| `useGoals()` | Goals data ophalen |
| `useUsers()` | User profiles ophalen |
| `useCreateGoal()` | Goal aanmaken |
| `useUpdateGoal()` | Goal bijwerken |
| `useIdeaCategories()` | Idee categorieën |
| `useIdeas()` | Ideeën ophalen |
| `useCreateIdea()` | Idee aanmaken |

---

## API Endpoints

### Goals
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/goals` | Alle doelen ophalen |
| GET | `/api/goals/:id` | Specifiek doel ophalen |
| POST | `/api/goals` | Nieuw doel aanmaken |
| PATCH | `/api/goals/:id` | Doel bijwerken |
| DELETE | `/api/goals/:id` | Doel verwijderen |

### Logs
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/logs` | Alle logs ophalen |
| GET | `/api/logs/:goalId` | Logs per doel |
| POST | `/api/logs` | Nieuwe log aanmaken |

### Users
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/users` | Alle profielen ophalen |
| GET | `/api/users/:id` | Specifiek profiel |
| PATCH | `/api/users/:id` | Profiel bijwerken |

### Activity
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/activity` | Activiteitenfeed ophalen |

### Notes
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/goals/:goalId/notes` | Notities per doel |
| POST | `/api/goals/:goalId/notes` | Notitie toevoegen |
| DELETE | `/api/notes/:id` | Notitie verwijderen |

### Photos
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/goals/:goalId/photos` | Foto's per doel |
| POST | `/api/goals/:goalId/photos` | Foto toevoegen |
| DELETE | `/api/photos/:id` | Foto verwijderen |

### Ideas
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/idea-categories` | Alle categorieën |
| POST | `/api/idea-categories` | Categorie aanmaken |
| PATCH | `/api/idea-categories/:id` | Categorie bijwerken |
| DELETE | `/api/idea-categories/:id` | Categorie verwijderen |
| GET | `/api/ideas` | Alle ideeën |
| POST | `/api/ideas` | Idee aanmaken |
| PATCH | `/api/ideas/:id` | Idee bijwerken |
| DELETE | `/api/ideas/:id` | Idee verwijderen |

---

## Styling & Theming

### Kleuren Systeem
De app gebruikt CSS variabelen voor consistente kleuren:

```css
/* Licht thema */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 346 77% 50%;
--secondary: 240 4.8% 95.9%;

/* Donker thema */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
}
```

### Categorie Kleuren
| Categorie | Kleur |
|-----------|-------|
| Lifestyle | Rose/Pink |
| Sparen | Emerald/Teal |
| Business | Blue/Indigo |
| Casa Hörnig | Orange/Amber |
| Mijlpalen | Yellow/Orange |
| Fun | Purple/Pink |

### Glasmorfisme
De app gebruikt "glass" effecten voor een moderne look:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Typography
- **Display Font**: Outfit (koppen)
- **Body Font**: DM Sans (tekst)

### Animaties
Framer Motion wordt gebruikt voor:
- Page transitions
- Card hover effecten
- Progress bar animaties
- Confetti vieringen
- List item animaties

---

## Deployment

De app draait op Replit met:
- Automatische builds via Vite
- PostgreSQL database (Neon-backed)
- Environment variables voor secrets
- Hot Module Replacement tijdens development

### Environment Variables
| Variable | Beschrijving |
|----------|--------------|
| `DATABASE_URL` | PostgreSQL connectie string |
| `SESSION_SECRET` | Sessie encryptie key |

---

## Toekomstige Uitbreidingen

Mogelijke features voor de toekomst:
- Date Jar (random date picker)
- Bucket List met wereldkaart
- Samen Koken Planner
- Gratitude Wall
- Wishlist Sync
- Push notificaties
- Export naar PDF
