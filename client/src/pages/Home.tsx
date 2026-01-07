import { useGoals } from "@/hooks/use-goals";
import { PixelHouse } from "@/components/PixelHouse";
import { CouplesProfile } from "@/components/CouplesProfile";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SavingsForecast } from "@/components/SavingsForecast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Heart, 
  Wallet, 
  Briefcase, 
  Home as HomeIcon, 
  Trophy, 
  Sparkles,
  ChevronRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

const categories = [
  { id: "lifestyle", label: "Lifestyle", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", gradient: "from-rose-500 to-pink-500" },
  { id: "savings", label: "Sparen", icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10", gradient: "from-emerald-500 to-teal-500" },
  { id: "business", label: "Business", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500 to-indigo-500" },
  { id: "casa", label: "Casa Hörnig", icon: HomeIcon, color: "text-orange-500", bg: "bg-orange-500/10", gradient: "from-orange-500 to-amber-500" },
  { id: "milestones", label: "Mijlpalen", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", gradient: "from-yellow-500 to-orange-500" },
  { id: "fun", label: "Fun", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", gradient: "from-purple-500 to-pink-500" },
];

export default function Home() {
  const { data: goals, isLoading } = useGoals();

  const getCategoryProgress = (categoryId: string) => {
    const categoryGoals = goals?.filter(g => g.category === categoryId) || [];
    if (categoryGoals.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    categoryGoals.forEach(goal => {
      const metadata = goal.metadata as any;
      
      if (goal.type === "room" && metadata?.items) {
        total += metadata.items.length;
        completed += metadata.items.filter((i: any) => i.completed).length;
      } else if (goal.type === "roadmap" && metadata?.steps) {
        metadata.steps.forEach((step: any) => {
          total += 1;
          if (step.completed) completed += 1;
          if (step.substeps) {
            total += step.substeps.length;
            completed += step.substeps.filter((s: any) => s.completed).length;
          }
        });
      } else if (goal.type === "boolean") {
        total += 1;
        if ((goal.currentValue || 0) >= 1) completed += 1;
      } else if (goal.targetValue) {
        total += goal.targetValue;
        completed += Math.min(goal.currentValue || 0, goal.targetValue);
      }
    });

    return { 
      completed, 
      total, 
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0 
    };
  };

  const casaGoals = goals?.filter(g => g.category === "casa") || [];
  const casaProgress = casaGoals.length > 0 
    ? casaGoals.reduce((sum, g) => sum + (g.currentValue || 0), 0) / casaGoals.reduce((sum, g) => sum + (g.targetValue || 100), 0) * 100
    : 0;

  const relationshipStart = new Date(2025, 9, 2);
  const daysTogether = differenceInDays(new Date(), relationshipStart);

  const milestoneGoals = goals?.filter(g => g.category === "milestones") || [];
  const completedMilestones = milestoneGoals.filter(g => (g.currentValue || 0) >= 1).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-end">
            <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded-lg animate-pulse mx-auto w-48" />
            <div className="h-6 bg-muted rounded-lg animate-pulse mx-auto w-64" />
          </div>
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-muted rounded-2xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <header className="flex items-center justify-between">
          <div className="w-9" />
          <CouplesProfile />
          <ThemeToggle />
        </header>

        <div className="text-center space-y-1">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold gradient-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Onze Doelen
          </motion.h1>
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Samen bouwen aan onze toekomst
          </motion.p>
        </div>

        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <PixelHouse progress={casaProgress} className="w-36 h-36 md:w-44 md:h-44" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-medium whitespace-nowrap">
              Casa Hörnig {Math.round(casaProgress)}%
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center w-full md:w-auto">
            <motion.div 
              className="bg-card rounded-2xl border border-border p-3 md:p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-rose-500">{daysTogether}</div>
              <div className="text-xs text-muted-foreground mt-1">dagen samen</div>
            </motion.div>
            <motion.div 
              className="bg-card rounded-2xl border border-border p-3 md:p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-amber-500">{completedMilestones}/{milestoneGoals.length}</div>
              <div className="text-xs text-muted-foreground mt-1">mijlpalen</div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm">Spaarprognose</h3>
            </div>
            <SavingsForecast />
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-sm">Recente Activiteit</h3>
            </div>
            <ActivityFeed />
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Categorieën</h2>
          <div className="grid gap-3">
            {categories.map((cat, idx) => {
              const progress = getCategoryProgress(cat.id);
              const Icon = cat.icon;
              
              return (
                <Link key={cat.id} href={`/goals/${cat.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="bg-card rounded-2xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-all group"
                    data-testid={`link-category-${cat.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0",
                        cat.bg
                      )}>
                        <Icon className={cn("w-5 h-5 md:w-6 md:h-6", cat.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="font-semibold text-sm md:text-base">{cat.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm text-muted-foreground">
                              {progress.percentage}%
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div 
                            className={cn("h-full rounded-full bg-gradient-to-r", cat.gradient)}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
