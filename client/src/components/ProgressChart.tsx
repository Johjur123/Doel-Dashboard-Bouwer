import { useLogs } from "@/hooks/use-goals";
import { Goal } from "@shared/schema";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { nl } from "date-fns/locale";
import { useMemo } from "react";

interface ProgressChartProps {
  goal: Goal;
  days?: number;
}

export function ProgressChart({ goal, days = 14 }: ProgressChartProps) {
  const { data: logs } = useLogs(goal.id);

  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);
    
    const interval = eachDayOfInterval({ start: startDate, end: today });
    
    let runningValue = 0;
    const logsByDay = new Map<string, number>();
    
    logs?.forEach(log => {
      if (!log.createdAt) return;
      const dayKey = format(startOfDay(new Date(log.createdAt)), "yyyy-MM-dd");
      logsByDay.set(dayKey, (logsByDay.get(dayKey) || 0) + log.value);
    });
    
    return interval.map(date => {
      const dayKey = format(date, "yyyy-MM-dd");
      const dayValue = logsByDay.get(dayKey) || 0;
      runningValue += dayValue;
      
      return {
        date: format(date, "d MMM", { locale: nl }),
        value: Math.max(0, runningValue),
        change: dayValue,
      };
    });
  }, [logs, days]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      lifestyle: "#f43f5e",
      savings: "#10b981",
      business: "#3b82f6",
      casa: "#f97316",
      milestones: "#eab308",
      fun: "#a855f7",
    };
    return colors[category] || "#6b7280";
  };

  const color = getCategoryColor(goal.category);

  if (!logs || logs.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
        Nog geen data beschikbaar
      </div>
    );
  }

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={`color-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
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
            stroke={color} 
            strokeWidth={2}
            fill={`url(#color-${goal.id})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
