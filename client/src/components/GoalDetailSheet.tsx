import { Goal } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLogs } from "@/hooks/use-goals";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

interface GoalDetailSheetProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDetailSheet({ goal, open, onOpenChange }: GoalDetailSheetProps) {
  if (!goal) return null;

  const { data: logs, isLoading } = useLogs(goal.id);

  // Prepare chart data
  const chartData = logs?.slice().reverse().map(log => ({
    date: format(new Date(log.createdAt || ""), "d MMM", { locale: nl }),
    value: log.value,
  })) || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6 text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{goal.icon || "🎯"}</span>
            <SheetTitle className="text-2xl font-display font-bold">{goal.title}</SheetTitle>
          </div>
          <SheetDescription className="text-base">
            Huidige stand: <span className="font-semibold text-foreground">{goal.currentValue} {goal.unit}</span>
            {goal.targetValue && <span> / {goal.targetValue} {goal.unit}</span>}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Chart Section */}
            {chartData.length > 1 && (
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  Progress History
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* History List */}
            <div>
              <h3 className="font-display font-bold text-lg mb-4">Geschiedenis</h3>
              <div className="space-y-3">
                {logs?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nog geen activiteiten.</p>
                ) : (
                  logs?.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/40 shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {log.value > 0 ? "+" : ""}{log.value} {goal.unit}
                        </span>
                        {log.note && <span className="text-xs text-muted-foreground">{log.note}</span>}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(new Date(log.createdAt || ""), "d MMM HH:mm", { locale: nl })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
