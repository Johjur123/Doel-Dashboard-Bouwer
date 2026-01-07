import { useGoals, useAllLogs } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { differenceInDays, addMonths, format } from "date-fns";
import { nl } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export function SavingsForecast() {
  const { data: goals } = useGoals();
  const { data: logs } = useAllLogs();

  const savingsGoals = goals?.filter(g => g.category === "savings") || [];
  const totalSaved = savingsGoals.reduce((sum, g) => sum + (g.currentValue || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + (g.targetValue || 0), 0);

  const savingsLogs = logs?.filter(l => 
    savingsGoals.some(g => g.id === l.goalId)
  ).sort((a, b) => 
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  ) || [];

  const monthlyAverage = savingsLogs.length > 0 
    ? savingsLogs.reduce((sum, l) => sum + (l.value > 0 ? l.value : 0), 0) / 
      Math.max(1, differenceInDays(new Date(), new Date(savingsLogs[0]?.createdAt || new Date())) / 30)
    : 500;

  const remaining = totalTarget - totalSaved;
  const monthsToGoal = remaining > 0 && monthlyAverage > 0 
    ? Math.ceil(remaining / monthlyAverage) 
    : 0;
  const estimatedDate = addMonths(new Date(), monthsToGoal);

  const chartData = [];
  let runningTotal = totalSaved;
  for (let i = 0; i <= Math.min(monthsToGoal + 2, 24); i++) {
    const date = addMonths(new Date(), i);
    chartData.push({
      month: format(date, "MMM yy", { locale: nl }),
      value: Math.min(runningTotal, totalTarget),
      target: totalTarget,
    });
    runningTotal += monthlyAverage;
  }

  const percentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <motion.div 
          className="bg-emerald-500/10 rounded-xl p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <TrendingUp className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            €{Math.round(monthlyAverage).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">per maand</div>
        </motion.div>
        
        <motion.div 
          className="bg-blue-500/10 rounded-xl p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Calendar className="w-5 h-5 mx-auto text-blue-500 mb-1" />
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {monthsToGoal > 0 ? `${monthsToGoal} mnd` : "Klaar!"}
          </div>
          <div className="text-xs text-muted-foreground">te gaan</div>
        </motion.div>
        
        <motion.div 
          className="bg-purple-500/10 rounded-xl p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Target className="w-5 h-5 mx-auto text-purple-500 mb-1" />
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {monthsToGoal > 0 ? format(estimatedDate, "MMM yy", { locale: nl }) : "Nu"}
          </div>
          <div className="text-xs text-muted-foreground">geschat doel</div>
        </motion.div>
      </div>

      {chartData.length > 2 && (
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={[0, 'dataMax']} />
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString()}`, 'Gespaard']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#colorValue)" 
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#94a3b8" 
                strokeDasharray="5 5" 
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          €{totalSaved.toLocaleString()} van €{totalTarget.toLocaleString()}
        </span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
