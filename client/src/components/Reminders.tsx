import { useGoals } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { Bell, AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Reminder {
  id: number;
  title: string;
  message: string;
  category: string;
  type: "warning" | "info" | "success";
}

export function Reminders() {
  const { data: goals } = useGoals();

  const reminders: Reminder[] = [];

  if (goals) {
    const lifestyleGoals = goals.filter(g => g.category === "lifestyle" && g.targetValue);
    lifestyleGoals.forEach(goal => {
      const percentage = goal.targetValue ? ((goal.currentValue || 0) / goal.targetValue) * 100 : 0;
      if (percentage < 30) {
        reminders.push({
          id: goal.id,
          title: goal.title,
          message: `Nog maar ${Math.round(percentage)}% - tijd om bij te werken!`,
          category: "lifestyle",
          type: "warning",
        });
      }
    });

    const savingsGoals = goals.filter(g => g.category === "savings" && g.targetValue);
    savingsGoals.forEach(goal => {
      if (goal.title.toLowerCase().includes("tokio") || goal.title.toLowerCase().includes("tokyo") || goal.title.toLowerCase().includes("canada")) {
        const remaining = (goal.targetValue || 0) - (goal.currentValue || 0);
        if (remaining > 0) {
          reminders.push({
            id: goal.id,
            title: goal.title,
            message: `Nog €${remaining.toLocaleString()} te gaan`,
            category: "savings",
            type: "info",
          });
        }
      }
    });

    const casaGoals = goals.filter(g => g.category === "casa");
    let casaCompleted = 0;
    let casaTotal = 0;
    casaGoals.forEach(g => {
      const metadata = g.metadata as any;
      if (metadata?.items) {
        casaTotal += metadata.items.length;
        casaCompleted += metadata.items.filter((i: any) => i.completed).length;
      }
    });
    if (casaTotal > 0 && casaCompleted < casaTotal) {
      const remaining = casaTotal - casaCompleted;
      reminders.push({
        id: -1,
        title: "Casa Hörnig",
        message: `${remaining} taken nog te doen`,
        category: "casa",
        type: "info",
      });
    }

    const milestoneGoals = goals.filter(g => g.category === "milestones");
    const completedMilestones = milestoneGoals.filter(g => (g.currentValue || 0) >= 1).length;
    if (completedMilestones > 0 && completedMilestones < milestoneGoals.length) {
      reminders.push({
        id: -2,
        title: "Mijlpalen",
        message: `${completedMilestones} van ${milestoneGoals.length} behaald - blijf doorgaan!`,
        category: "milestones",
        type: "success",
      });
    }
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Alles op schema!
      </div>
    );
  }

  const getIcon = (type: Reminder["type"]) => {
    switch (type) {
      case "warning": return AlertCircle;
      case "success": return TrendingUp;
      default: return Bell;
    }
  };

  const getColors = (type: Reminder["type"]) => {
    switch (type) {
      case "warning": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "success": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default: return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-2">
      {reminders.slice(0, 4).map((reminder, idx) => {
        const Icon = getIcon(reminder.type);
        const colors = getColors(reminder.type);

        return (
          <motion.div
            key={`${reminder.category}-${reminder.id}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href={`/goals/${reminder.category}`}>
              <div
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                  colors
                )}
                data-testid={`reminder-${reminder.category}-${reminder.id}`}
              >
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{reminder.title}</p>
                  <p className="text-xs opacity-80 truncate">{reminder.message}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
