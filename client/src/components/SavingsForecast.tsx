import { useGoals } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { Plane, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function SavingsForecast() {
  const { data: goals } = useGoals();

  const travelGoals = goals?.filter(g => 
    g.category === "savings" && 
    (g.title.toLowerCase().includes("tokio") || 
     g.title.toLowerCase().includes("tokyo") ||
     g.title.toLowerCase().includes("canada") ||
     g.title.toLowerCase().includes("new york"))
  ) || [];

  if (travelGoals.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Geen reisdoelen gevonden
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {travelGoals.map((goal, idx) => {
        const saved = goal.currentValue || 0;
        const target = goal.targetValue || 0;
        const remaining = Math.max(0, target - saved);
        const percentage = target > 0 ? Math.round((saved / target) * 100) : 0;
        const isComplete = remaining === 0;

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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  goal.title.toLowerCase().includes("tokio") || goal.title.toLowerCase().includes("tokyo")
                    ? "bg-pink-500/10 text-pink-500"
                    : "bg-red-500/10 text-red-500"
                )}>
                  {goal.title.toLowerCase().includes("tokio") || goal.title.toLowerCase().includes("tokyo") 
                    ? <Plane className="w-4 h-4" />
                    : <MapPin className="w-4 h-4" />
                  }
                </div>
                <span className="font-medium text-sm">{goal.title}</span>
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
                className={cn(
                  "h-full rounded-full",
                  goal.title.toLowerCase().includes("tokio") || goal.title.toLowerCase().includes("tokyo")
                    ? "bg-gradient-to-r from-pink-500 to-rose-400"
                    : "bg-gradient-to-r from-red-500 to-orange-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Gespaard: <span className="text-foreground font-medium">€{saved.toLocaleString()}</span>
              </span>
              {isComplete ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Doel bereikt!
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Mist nog: <span className="text-foreground font-bold">€{remaining.toLocaleString()}</span>
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
