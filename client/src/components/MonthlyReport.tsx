import { useGoals, useAllLogs } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { TrendingUp, Check, Target, Calendar } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { nl } from "date-fns/locale";

export function MonthlyReport() {
  const { data: goals } = useGoals();
  const { data: logs } = useAllLogs();

  const thirtyDaysAgo = subDays(new Date(), 30);

  const recentLogs = logs?.filter(l => 
    l.createdAt && isAfter(new Date(l.createdAt), thirtyDaysAgo)
  ) || [];

  const savingsGoals = goals?.filter(g => g.category === "savings") || [];
  const totalSavedThisMonth = recentLogs
    .filter(l => savingsGoals.some(g => g.id === l.goalId))
    .reduce((sum, l) => sum + (l.value > 0 ? l.value : 0), 0);

  const milestoneGoals = goals?.filter(g => g.category === "milestones") || [];
  const completedMilestones = milestoneGoals.filter(g => (g.currentValue || 0) >= 1).length;

  const casaGoals = goals?.filter(g => g.category === "casa") || [];
  let casaCompleted = 0;
  let casaTotal = 0;
  casaGoals.forEach(g => {
    const metadata = g.metadata as any;
    if (metadata?.items) {
      casaTotal += metadata.items.length;
      casaCompleted += metadata.items.filter((i: any) => i.completed).length;
    }
  });

  const businessGoals = goals?.filter(g => g.category === "business") || [];
  let businessCompleted = 0;
  let businessTotal = 0;
  businessGoals.forEach(g => {
    const metadata = g.metadata as any;
    if (metadata?.steps) {
      metadata.steps.forEach((step: any) => {
        businessTotal += 1;
        if (step.completed) businessCompleted += 1;
        if (step.substeps) {
          businessTotal += step.substeps.length;
          businessCompleted += step.substeps.filter((s: any) => s.completed).length;
        }
      });
    }
  });

  const stats = [
    {
      label: "Gespaard (30 dagen)",
      value: `€${totalSavedThisMonth.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Mijlpalen totaal",
      value: `${completedMilestones}/${milestoneGoals.length}`,
      icon: Check,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Casa totaal",
      value: `${casaCompleted}/${casaTotal}`,
      icon: Target,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Business totaal",
      value: `${businessCompleted}/${businessTotal}`,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">
          Maandoverzicht
        </h3>
        <span className="text-xs text-muted-foreground">
          {format(thirtyDaysAgo, "d MMM", { locale: nl })} - {format(new Date(), "d MMM", { locale: nl })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`${stat.bg} rounded-xl p-3`}
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
            </div>
            <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
