import { useGoals, useUsers } from "@/hooks/use-goals";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SavingsForecast } from "@/components/SavingsForecast";
import { MonthlyReport } from "@/components/MonthlyReport";
import { Reminders } from "@/components/Reminders";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IdeasBox } from "@/components/IdeasBox";
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
  Activity,
  BarChart3,
  Bell,
  Target,
  TrendingUp
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
  const { data: users } = useUsers();

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

  const relationshipStart = new Date(2025, 9, 2);
  const daysTogether = differenceInDays(new Date(), relationshipStart);

  const milestoneGoals = goals?.filter(g => g.category === "milestones") || [];
  const completedMilestones = milestoneGoals.filter(g => (g.currentValue || 0) >= 1).length;
  
  const totalGoals = goals?.length || 0;
  const overallProgress = categories.reduce((sum, cat) => sum + getCategoryProgress(cat.id).percentage, 0) / categories.length;
  
  const user1Name = users?.[0]?.name || "Partner 1";
  const user2Name = users?.[1]?.name || "Partner 2";

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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-background to-violet-100/40 dark:from-rose-950/20 dark:via-background dark:to-violet-950/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-400/10 dark:bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 pt-6 pb-8">
          <header className="flex items-center justify-end mb-8">
            <ThemeToggle />
          </header>

          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-rose-500 via-violet-500 to-rose-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {user1Name} & {user2Name}
              </span>
            </h1>
            <p className="text-muted-foreground">
              Samen bouwen aan jullie toekomst
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-500">{daysTogether}</div>
              <div className="text-xs text-muted-foreground">dagen samen</div>
            </div>
            
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-500">{completedMilestones}/{milestoneGoals.length}</div>
              <div className="text-xs text-muted-foreground">mijlpalen</div>
            </div>
            
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-violet-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-violet-500">{totalGoals}</div>
              <div className="text-xs text-muted-foreground">actieve doelen</div>
            </div>
            
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-500">{Math.round(overallProgress)}%</div>
              <div className="text-xs text-muted-foreground">totale voortgang</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-semibold">Spaarprognose</h3>
              </div>
              <SavingsForecast />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="glass-card p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-semibold">Recente Activiteit</h3>
              </div>
              <ActivityFeed />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="font-semibold">Maandoverzicht</h3>
              </div>
              <MonthlyReport />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="glass-card p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="font-semibold">Herinneringen</h3>
              </div>
              <Reminders />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="md:col-span-2"
          >
            <IdeasBox />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h2 className="text-display-sm px-1">Categorieën</h2>
          <div className="grid gap-3">
            {categories.map((cat, idx) => {
              const progress = getCategoryProgress(cat.id);
              const Icon = cat.icon;
              
              return (
                <Link key={cat.id} href={`/goals/${cat.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                    className="interactive-card p-4 group"
                    data-testid={`link-category-${cat.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                        cat.bg
                      )}>
                        <Icon className={cn("w-6 h-6", cat.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="font-semibold">{cat.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-medium text-muted-foreground">
                              {progress.percentage}%
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div 
                            className={cn("h-full rounded-full bg-gradient-to-r", cat.gradient)}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.7 + idx * 0.05 }}
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
