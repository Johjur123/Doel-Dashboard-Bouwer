import { useGoals } from "@/hooks/use-goals";
import { useQuery } from "@tanstack/react-query";
import { Log } from "@shared/schema";
import { motion } from "framer-motion";
import { Plane, MapPin, TrendingUp, Calendar, Target, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInMonths, addMonths, isAfter } from "date-fns";
import { nl } from "date-fns/locale";

export function SavingsForecast() {
  const { data: goals } = useGoals();
  const { data: logs } = useQuery<Log[]>({ queryKey: ["/api/logs"] });

  const savingsGoals = goals?.filter(g => 
    g.category === "savings" && 
    g.targetValue && 
    g.targetValue > 0
  ) || [];

  if (savingsGoals.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Geen spaardoelen gevonden
      </div>
    );
  }

  const calculateMonthlyRate = (goalId: number): number => {
    if (!logs) return 0;
    const goalLogs = logs.filter(l => l.goalId === goalId);
    if (goalLogs.length === 0) return 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = goalLogs.filter(l => l.createdAt && new Date(l.createdAt) >= thirtyDaysAgo);
    const totalRecent = recentLogs.reduce((sum, l) => sum + l.value, 0);
    
    return totalRecent;
  };

  const getGoalIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("tokio") || lowerTitle.includes("tokyo") || lowerTitle.includes("japan")) {
      return { icon: Plane, color: "pink" };
    }
    if (lowerTitle.includes("canada") || lowerTitle.includes("new york") || lowerTitle.includes("reis")) {
      return { icon: MapPin, color: "red" };
    }
    if (lowerTitle.includes("nood") || lowerTitle.includes("emergency")) {
      return { icon: CircleDollarSign, color: "blue" };
    }
    return { icon: Target, color: "purple" };
  };

  return (
    <div className="space-y-4">
      {savingsGoals.map((goal, idx) => {
        const saved = goal.currentValue || 0;
        const target = goal.targetValue || 0;
        const remaining = Math.max(0, target - saved);
        const percentage = target > 0 ? Math.round((saved / target) * 100) : 0;
        const isComplete = remaining === 0;
        const monthlyRate = calculateMonthlyRate(goal.id);
        
        const { icon: IconComponent, color } = getGoalIcon(goal.title);
        
        let targetDate: Date | null = null;
        let monthsToTarget: number | null = null;
        let monthlyNeeded: number | null = null;
        let projectedDate: Date | null = null;
        let isOnTrack = false;

        if (goal.targetDate) {
          targetDate = new Date(goal.targetDate);
          monthsToTarget = Math.max(1, differenceInMonths(targetDate, new Date()));
          monthlyNeeded = Math.ceil(remaining / monthsToTarget);
          
          if (monthlyRate > 0) {
            const monthsNeeded = Math.ceil(remaining / monthlyRate);
            projectedDate = addMonths(new Date(), monthsNeeded);
            isOnTrack = !isAfter(projectedDate, targetDate);
          }
        } else if (monthlyRate > 0 && remaining > 0) {
          const monthsNeeded = Math.ceil(remaining / monthlyRate);
          projectedDate = addMonths(new Date(), monthsNeeded);
        }

        const colorStyles = {
          pink: {
            bg: "bg-pink-500/10",
            text: "text-pink-500",
            gradient: "from-pink-500 to-rose-400",
          },
          red: {
            bg: "bg-red-500/10",
            text: "text-red-500",
            gradient: "from-red-500 to-orange-400",
          },
          blue: {
            bg: "bg-blue-500/10",
            text: "text-blue-500",
            gradient: "from-blue-500 to-sky-400",
          },
          purple: {
            bg: "bg-purple-500/10",
            text: "text-purple-500",
            gradient: "from-purple-500 to-violet-400",
          },
        }[color] || { bg: "bg-primary/10", text: "text-primary", gradient: "from-primary to-primary/80" };

        return (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "rounded-xl p-4 border",
              isComplete 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-card border-border"
            )}
            data-testid={`savings-goal-${goal.id}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorStyles.bg, colorStyles.text)}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium text-sm">{goal.title}</span>
                  {targetDate && !isComplete && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Doel: {format(targetDate, "MMM yyyy", { locale: nl })}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                isComplete 
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {percentage}%
              </span>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", colorStyles.gradient)}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, percentage)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">
                Gespaard: <span className="text-foreground font-medium">€{saved.toLocaleString()}</span>
              </span>
              {isComplete ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Doel bereikt!
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Nog: <span className="text-foreground font-bold">€{remaining.toLocaleString()}</span>
                </span>
              )}
            </div>

            {!isComplete && (
              <div className="pt-3 border-t border-border space-y-2">
                {monthlyNeeded !== null && monthsToTarget !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Nodig per maand
                    </span>
                    <span className={cn(
                      "font-medium",
                      monthlyRate >= monthlyNeeded 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-amber-600 dark:text-amber-400"
                    )}>
                      €{monthlyNeeded.toLocaleString()}/mnd
                    </span>
                  </div>
                )}

                {monthlyRate > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Huidige snelheid
                    </span>
                    <span className="font-medium text-foreground">
                      €{monthlyRate.toLocaleString()}/mnd
                    </span>
                  </div>
                )}

                {projectedDate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Verwachte bereikdatum
                    </span>
                    <span className={cn(
                      "font-medium",
                      targetDate && isOnTrack 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : targetDate 
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                    )}>
                      {format(projectedDate, "MMM yyyy", { locale: nl })}
                    </span>
                  </div>
                )}

                {targetDate && monthlyRate > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className={cn(
                      "text-xs font-medium rounded-md px-2 py-1 text-center",
                      isOnTrack 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}>
                      {isOnTrack 
                        ? "Op schema! Je haalt je doel." 
                        : `Verhoog naar €${monthlyNeeded?.toLocaleString()}/mnd om op tijd te zijn`
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
