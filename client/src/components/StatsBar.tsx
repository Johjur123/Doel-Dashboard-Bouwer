import { useStats } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { Target, Flame, Zap, CheckCircle2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsBarProps {
  onActivityClick: () => void;
}

export function StatsBar({ onActivityClick }: StatsBarProps) {
  const { data: stats, isLoading } = useStats();

  const statItems = [
    {
      icon: Zap,
      label: "Totaal XP",
      value: stats?.totalXp || 0,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Flame,
      label: "Streak",
      value: stats?.currentStreak || 0,
      suffix: " dagen",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: CheckCircle2,
      label: "Voltooid",
      value: stats?.goalsCompleted || 0,
      suffix: " doelen",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Target,
      label: "Acties",
      value: stats?.totalLogs || 0,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 w-32 rounded-2xl bg-muted animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shrink-0",
            "bg-card border border-border/50 shadow-sm"
          )}
        >
          <div className={cn("p-2 rounded-xl", item.bg)}>
            <item.icon className={cn("w-5 h-5", item.color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="font-display font-bold text-lg">
              {item.value.toLocaleString()}
              {item.suffix && <span className="text-sm font-normal text-muted-foreground">{item.suffix}</span>}
            </p>
          </div>
        </motion.div>
      ))}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onActivityClick}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shrink-0 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 hover:border-primary/40 transition-colors"
        data-testid="button-open-activity"
      >
        <div className="p-2 rounded-xl bg-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Bekijk</p>
          <p className="font-display font-bold">Activiteit</p>
        </div>
      </motion.button>
    </div>
  );
}
