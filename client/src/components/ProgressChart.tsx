import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLogs } from "@/hooks/use-goals";
import { Goal } from "@shared/schema";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { nl } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressChartProps {
  goal: Goal;
  days?: number;
  showStats?: boolean;
  className?: string;
}

export function ProgressChart({ goal, days = 14, showStats = false, className }: ProgressChartProps) {
  const { data: logs, isLoading, isError } = useLogs(goal.id);

  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);
    const interval = eachDayOfInterval({ start: startDate, end: today });
    
    const logsByDate = new Map<string, number>();
    logs?.forEach(log => {
      if (!log.createdAt) return;
      const dateKey = format(startOfDay(new Date(log.createdAt)), "yyyy-MM-dd");
      logsByDate.set(dateKey, (logsByDate.get(dateKey) || 0) + log.value);
    });
    
    let runningTotal = 0;
    return interval.map(date => {
      const dateKey = format(date, "yyyy-MM-dd");
      const dayValue = logsByDate.get(dateKey) || 0;
      runningTotal += dayValue;
      
      return {
        date: dateKey,
        label: format(date, "d MMM", { locale: nl }),
        shortLabel: format(date, "d", { locale: nl }),
        value: Math.max(0, runningTotal),
        dailyChange: dayValue,
      };
    });
  }, [logs, days]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return { direction: "neutral" as const, percentage: 0 };
    
    const recentDays = Math.min(7, chartData.length);
    const recent = chartData.slice(-recentDays);
    const firstValue = recent[0]?.value || 0;
    const lastValue = recent[recent.length - 1]?.value || 0;
    
    if (firstValue === 0) {
      return lastValue > 0 
        ? { direction: "up" as const, percentage: 100 } 
        : { direction: "neutral" as const, percentage: 0 };
    }
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      direction: change > 0 ? "up" as const : change < 0 ? "down" as const : "neutral" as const,
      percentage: Math.abs(change),
    };
  }, [chartData]);

  const categoryColors: Record<string, { stroke: string; fill: string }> = {
    lifestyle: { stroke: "#f43f5e", fill: "#f43f5e" },
    savings: { stroke: "#10b981", fill: "#10b981" },
    business: { stroke: "#3b82f6", fill: "#3b82f6" },
    casa: { stroke: "#f97316", fill: "#f97316" },
    milestones: { stroke: "#eab308", fill: "#eab308" },
    fun: { stroke: "#a855f7", fill: "#a855f7" },
  };
  
  const colors = categoryColors[goal.category] || categoryColors.lifestyle;
  const gradientId = `gradient-chart-${goal.id}`;

  if (isLoading) {
    return (
      <div className={cn("h-24 flex items-center justify-center", className)}>
        <div className="w-full h-16 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("h-24 flex items-center justify-center text-muted-foreground text-sm", className)}>
        Kon data niet laden
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className={cn("h-24 flex items-center justify-center text-muted-foreground text-sm", className)}>
        Nog geen data beschikbaar
      </div>
    );
  }

  if (showStats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("glass-card p-5", className)}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Progressie - {days} dagen</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{goal.title}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
            trend.direction === "up" && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
            trend.direction === "down" && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
            trend.direction === "neutral" && "bg-secondary text-muted-foreground"
          )}>
            {trend.direction === "up" && <TrendingUp className="w-3.5 h-3.5" />}
            {trend.direction === "down" && <TrendingDown className="w-3.5 h-3.5" />}
            {trend.direction === "neutral" && <Minus className="w-3.5 h-3.5" />}
            <span>{trend.percentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="h-40 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.fill} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.fill} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey="shortLabel" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="glass-card p-2.5 shadow-lg border border-border/50">
                      <p className="text-xs font-medium">{data.label}</p>
                      <p className="text-sm font-semibold mt-0.5">{data.value} {goal.unit}</p>
                      {data.dailyChange !== 0 && (
                        <p className={cn(
                          "text-xs mt-1",
                          data.dailyChange > 0 ? "text-emerald-500" : "text-red-500"
                        )}>
                          {data.dailyChange > 0 ? "+" : ""}{data.dailyChange} vandaag
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: colors.stroke, strokeWidth: 2, stroke: "white" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground">Huidig</p>
            <p className="text-lg font-bold">{goal.currentValue || 0}</p>
          </div>
          <div className="text-center flex-1 border-x border-border/50">
            <p className="text-xs text-muted-foreground">Doel</p>
            <p className="text-lg font-bold">{goal.targetValue || 0}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground">Resterend</p>
            <p className="text-lg font-bold">
              {Math.max(0, (goal.targetValue || 0) - (goal.currentValue || 0))}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn("h-24 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={`color-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.stroke} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="shortLabel" 
            tick={{ fontSize: 9 }} 
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'value' ? `${value} ${goal.unit || ''}` : `+${value}`,
              name === 'value' ? 'Totaal' : 'Wijziging'
            ]}
            labelStyle={{ fontSize: 11 }}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: 11,
              padding: '6px 10px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={colors.stroke} 
            strokeWidth={2}
            fill={`url(#color-${goal.id})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
