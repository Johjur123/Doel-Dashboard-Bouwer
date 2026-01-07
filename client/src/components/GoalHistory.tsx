import { useLogs, useGoals } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface GoalHistoryProps {
  goalId: number;
}

export function GoalHistory({ goalId }: GoalHistoryProps) {
  const { data: logs, isLoading } = useLogs(goalId);
  const { data: goals } = useGoals();

  const goal = goals?.find(g => g.id === goalId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <div className="h-4 bg-muted rounded flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Nog geen geschiedenis
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
        <Clock className="w-4 h-4" />
        <span>Geschiedenis</span>
      </div>

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
        
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {logs.slice(0, 15).map((log, idx) => {
            const isPositive = log.value > 0;
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 relative"
                data-testid={`history-item-${log.id}`}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center z-10",
                  isPositive ? "bg-emerald-500" : "bg-rose-500"
                )}>
                  {isPositive 
                    ? <TrendingUp className="w-2.5 h-2.5 text-white" />
                    : <TrendingDown className="w-2.5 h-2.5 text-white" />
                  }
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {isPositive ? "+" : ""}{log.value} {goal?.unit || ""}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {log.createdAt 
                        ? format(new Date(log.createdAt), "d MMM HH:mm", { locale: nl })
                        : ""
                      }
                    </span>
                  </div>
                  {log.note && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.note}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
