import { useActivities, useUsers, useGoals } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Check, Plus, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Goal } from "@shared/schema";

export function ActivityFeed() {
  const { data: activities, isLoading } = useActivities();
  const { data: users } = useUsers();
  const { data: goals } = useGoals();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Nog geen activiteiten
      </div>
    );
  }

  const getUser = (userId: number) => users?.find(u => u.id === userId);
  const getGoal = (goalId: number | null) => goalId ? goals?.find(g => g.id === goalId) : null;

  const getActionIcon = (action: string) => {
    switch (action) {
      case "log": return TrendingUp;
      case "complete": return Check;
      case "add": return Plus;
      default: return Clock;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "log": return "text-blue-500 bg-blue-500/10";
      case "complete": return "text-emerald-500 bg-emerald-500/10";
      case "add": return "text-purple-500 bg-purple-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getCategoryColor = (goal: Goal | null | undefined) => {
    if (!goal) return "text-muted-foreground";
    const colors: Record<string, string> = {
      lifestyle: "text-rose-500",
      savings: "text-emerald-500",
      business: "text-blue-500",
      casa: "text-orange-500",
      milestones: "text-yellow-500",
      fun: "text-purple-500",
    };
    return colors[goal.category] || "text-muted-foreground";
  };

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {activities.slice(0, 10).map((activity, idx) => {
        const user = getUser(activity.userId);
        const goal = getGoal(activity.goalId);
        const Icon = getActionIcon(activity.action);
        const colorClass = getActionColor(activity.action);

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 group"
            data-testid={`activity-item-${activity.id}`}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-secondary">
                {user?.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", colorClass)}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-sm truncate">{activity.description}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {user?.name || "Onbekend"}
                </span>
                {goal && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className={cn("text-xs truncate flex items-center gap-1", getCategoryColor(goal))}>
                      <Target className="w-3 h-3" />
                      {goal.title}
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {activity.createdAt 
                    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: nl })
                    : "zojuist"
                  }
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
