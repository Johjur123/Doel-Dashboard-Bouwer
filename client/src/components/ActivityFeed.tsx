import { useActivities, useGoals, useUsers } from "@/hooks/use-goals";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Activity, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityFeed({ isOpen, onClose }: ActivityFeedProps) {
  const { data: activities } = useActivities();
  const { data: users } = useUsers();
  const { data: goals } = useGoals();

  const getUserName = (userId: number) => {
    return users?.find(u => u.id === userId)?.name || "Gebruiker";
  };

  const getUserAvatar = (userId: number) => {
    return users?.find(u => u.id === userId)?.avatar || "👤";
  };

  const getGoalIcon = (goalId: number | null) => {
    if (!goalId) return "🎯";
    return goals?.find(g => g.id === goalId)?.icon || "🎯";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Activiteit</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                data-testid="button-close-activity"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {activities?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nog geen activiteiten
                </div>
              ) : (
                activities?.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-lg shrink-0">
                      {getUserAvatar(activity.userId)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {getUserName(activity.userId)}
                        </span>
                        <span className="text-lg">{getGoalIcon(activity.goalId)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt || ""), "d MMM HH:mm", { locale: nl })}
                        </span>
                        {activity.xpEarned && activity.xpEarned > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-primary font-medium">
                            <Zap className="w-3 h-3" />
                            +{activity.xpEarned}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
