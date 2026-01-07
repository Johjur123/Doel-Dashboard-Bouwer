import { useState } from "react";
import { Goal, RoadmapStep } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLogs, useCreateLog, useUpdateGoal } from "@/hooks/use-goals";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Loader2, TrendingUp, Plus, Minus, Check, Calendar, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GoalDetailSheetProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDetailSheet({ goal, open, onOpenChange }: GoalDetailSheetProps) {
  const [logValue, setLogValue] = useState(1);
  const [logNote, setLogNote] = useState("");
  
  const { data: logs, isLoading } = useLogs(goal?.id || 0);
  const createLog = useCreateLog();
  const updateGoal = useUpdateGoal();

  if (!goal) return null;

  const chartData = logs?.slice().reverse().slice(-14).map(log => ({
    date: format(new Date(log.createdAt || ""), "d MMM", { locale: nl }),
    value: log.value,
  })) || [];

  const handleLog = () => {
    createLog.mutate({
      goalId: goal.id,
      value: logValue,
      note: logNote || undefined,
    });
    setLogValue(1);
    setLogNote("");
  };

  const handleToggleStep = (stepIndex: number) => {
    if (!goal.metadata) return;
    const metadata = goal.metadata as any;
    const steps = metadata.steps as RoadmapStep[];
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].completed = !updatedSteps[stepIndex].completed;
    const completedCount = updatedSteps.filter(s => s.completed).length;
    
    updateGoal.mutate({
      id: goal.id,
      currentValue: completedCount,
      metadata: { ...metadata, steps: updatedSteps },
    });
  };

  const percentage = goal.targetValue 
    ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) 
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background">
        <SheetHeader className="mb-6 text-left">
          <div className="flex items-center gap-4 mb-3">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-4xl shadow-sm"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              {goal.icon || "🎯"}
            </motion.div>
            <div>
              <SheetTitle className="text-2xl font-display font-bold">{goal.title}</SheetTitle>
              <SheetDescription className="text-base">
                {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
              </SheetDescription>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Huidige stand</span>
              <span className="text-sm font-medium">{Math.round(percentage)}%</span>
            </div>
            <div className="h-3 w-full bg-background rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xl font-display font-bold">{goal.currentValue} {goal.unit}</span>
              {goal.targetValue && (
                <span className="text-muted-foreground">/ {goal.targetValue} {goal.unit}</span>
              )}
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {goal.type !== "roadmap" && goal.type !== "boolean" && (
              <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Nieuwe log toevoegen
                </h3>
                <div className="flex gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
                    <button
                      onClick={() => setLogValue(Math.max(-99, logValue - 1))}
                      className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-muted transition-colors"
                      data-testid="button-log-decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{logValue}</span>
                    <button
                      onClick={() => setLogValue(logValue + 1)}
                      className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-muted transition-colors"
                      data-testid="button-log-increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleLog}
                    disabled={createLog.isPending}
                    className="flex-1 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    data-testid="button-submit-log"
                  >
                    {createLog.isPending ? "Opslaan..." : "Toevoegen"}
                  </button>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="Optionele notitie..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="input-log-note"
                  />
                </div>
              </div>
            )}

            {goal.type === "roadmap" && goal.metadata && (
              <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
                <h3 className="font-display font-bold text-sm mb-4">Stappenplan</h3>
                <div className="space-y-2">
                  {((goal.metadata as any).steps as RoadmapStep[]).map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleToggleStep(idx)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                        step.completed 
                          ? "bg-emerald-500/10 border border-emerald-500/20" 
                          : "bg-secondary hover:bg-secondary/80"
                      )}
                      data-testid={`detail-step-${idx}`}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        step.completed 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-muted-foreground/30"
                      )}>
                        {step.completed && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <span className={cn(
                          "text-sm font-medium",
                          step.completed && "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {step.title}
                        </span>
                        {step.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{step.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {chartData.length > 1 && (
              <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-sm">Geschiedenis</h3>
                </div>
                <div className="h-[180px] w-full">
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
                        fontSize={11} 
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
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-display font-bold text-sm">Recente logs</h3>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {logs?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 text-sm">Nog geen activiteiten.</p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {logs?.slice(0, 10).map((log, idx) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                      >
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-semibold text-sm",
                            log.value > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                          )}>
                            {log.value > 0 ? "+" : ""}{log.value} {goal.unit}
                          </span>
                          {log.note && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {log.note}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt || ""), "d MMM HH:mm", { locale: nl })}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
