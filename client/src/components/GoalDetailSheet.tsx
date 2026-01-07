import { useState } from "react";
import { Goal, RoadmapStep, RoomItem } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLogs, useCreateLog, useUpdateGoal } from "@/hooks/use-goals";
import { GoalNotes } from "@/components/GoalNotes";
import { PeriodHistory } from "@/components/PeriodHistory";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, addDays, addMonths } from "date-fns";
import { nl } from "date-fns/locale";
import { Loader2, Plus, Minus, Check, Calendar, MessageSquare, Trash2, X, Clock, CalendarDays } from "lucide-react";
import { getGoalIcon } from "@/lib/goal-icons";
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
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  const { data: logs, isLoading } = useLogs(goal?.id || 0);
  const createLog = useCreateLog();
  const updateGoal = useUpdateGoal();

  if (!goal) return null;

  const handleLog = () => {
    createLog.mutate({
      goalId: goal.id,
      value: logValue,
      note: logNote || undefined,
    });
    setLogValue(1);
    setLogNote("");
  };

  const handleToggleStep = (stepIndex: number, substepIndex?: number) => {
    if (!goal.metadata) return;
    const metadata = goal.metadata as any;
    const steps = [...(metadata.steps as RoadmapStep[])];
    
    if (substepIndex !== undefined && steps[stepIndex].substeps) {
      const substeps = [...steps[stepIndex].substeps!];
      substeps[substepIndex].completed = !substeps[substepIndex].completed;
      steps[stepIndex].substeps = substeps;
    } else {
      steps[stepIndex].completed = !steps[stepIndex].completed;
    }
    
    const completedCount = steps.filter(s => s.completed).length;
    
    updateGoal.mutate({
      id: goal.id,
      currentValue: completedCount,
      metadata: { ...metadata, steps },
    });
  };

  const handleToggleRoomItem = (itemIndex: number) => {
    if (!goal.metadata) return;
    const metadata = goal.metadata as any;
    const items = [...(metadata.items as RoomItem[])];
    items[itemIndex].completed = !items[itemIndex].completed;
    
    const completedCount = items.filter(i => i.completed).length;
    
    updateGoal.mutate({
      id: goal.id,
      currentValue: completedCount,
      targetValue: items.length,
      metadata: { ...metadata, items },
    });
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    const metadata = (goal.metadata || {}) as any;
    
    if (goal.type === "room") {
      const items = [...(metadata.items || []), { title: newItemTitle.trim(), completed: false }];
      updateGoal.mutate({
        id: goal.id,
        targetValue: items.length,
        metadata: { ...metadata, items },
      });
    } else if (goal.type === "roadmap") {
      const steps = [...(metadata.steps || []), { title: newItemTitle.trim(), completed: false }];
      updateGoal.mutate({
        id: goal.id,
        targetValue: steps.length,
        metadata: { ...metadata, steps },
      });
    }
    
    setNewItemTitle("");
    setIsAddingItem(false);
  };

  const handleRemoveItem = (index: number) => {
    if (!goal.metadata) return;
    const metadata = goal.metadata as any;
    
    if (goal.type === "room") {
      const items = (metadata.items as RoomItem[]).filter((_, i) => i !== index);
      const completedCount = items.filter(i => i.completed).length;
      updateGoal.mutate({
        id: goal.id,
        currentValue: completedCount,
        targetValue: items.length,
        metadata: { ...metadata, items },
      });
    } else if (goal.type === "roadmap") {
      const steps = (metadata.steps as RoadmapStep[]).filter((_, i) => i !== index);
      const completedCount = steps.filter(s => s.completed).length;
      updateGoal.mutate({
        id: goal.id,
        currentValue: completedCount,
        targetValue: steps.length,
        metadata: { ...metadata, steps },
      });
    }
  };

  const percentage = goal.targetValue 
    ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) 
    : 0;

  const relationshipStart = new Date(2025, 9, 2);
  const isAutoCalculated = goal.category === "fun" && goal.title.toLowerCase().includes("dagen samen");
  const displayValue = isAutoCalculated 
    ? differenceInDays(new Date(), relationshipStart)
    : (goal.currentValue || 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
        <SheetHeader className="mb-6 text-left">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              {(() => {
                const IconComponent = getGoalIcon(goal.category);
                return <IconComponent className="w-7 h-7 text-primary" />;
              })()}
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">{goal.title}</SheetTitle>
              <SheetDescription className="text-sm capitalize">
                {goal.category}
              </SheetDescription>
            </div>
          </div>
          
          {goal.type === "boolean" ? (
            <div className={cn(
              "rounded-xl p-4 text-center",
              (goal.currentValue || 0) >= 1 
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-secondary text-muted-foreground"
            )}>
              <span className="text-lg font-semibold">
                {(goal.currentValue || 0) >= 1 ? "Voltooid!" : "Nog niet behaald"}
              </span>
              {goal.unit && <p className="text-sm mt-1">{goal.unit}</p>}
            </div>
          ) : isAutoCalculated ? (
            <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-4 text-center">
              <span className="text-4xl font-bold text-rose-500">{displayValue.toLocaleString()}</span>
              <p className="text-sm text-muted-foreground mt-1">{goal.unit} sinds 02-10-2025</p>
            </div>
          ) : goal.targetValue ? (
            <div className="bg-secondary/50 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Voortgang</span>
                <span className="text-sm font-medium">{Math.round(percentage)}%</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="font-semibold">{goal.currentValue} {goal.unit}</span>
                <span className="text-muted-foreground">/ {goal.targetValue}</span>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <span className="text-3xl font-bold">{displayValue.toLocaleString()}</span>
              <p className="text-sm text-muted-foreground mt-1">{goal.unit}</p>
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {(goal.type === "counter" || goal.type === "progress") && !isAutoCalculated && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Log toevoegen
                </h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setLogValue(Math.max(-99, logValue - 1))}
                      className="w-7 h-7 rounded bg-background flex items-center justify-center hover:bg-muted transition-colors"
                      data-testid="button-log-decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center font-semibold">{logValue}</span>
                    <button
                      onClick={() => setLogValue(logValue + 1)}
                      className="w-7 h-7 rounded bg-background flex items-center justify-center hover:bg-muted transition-colors"
                      data-testid="button-log-increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={handleLog}
                    disabled={createLog.isPending}
                    className="flex-1 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    data-testid="button-submit-log"
                  >
                    {createLog.isPending ? "..." : "Toevoegen"}
                  </button>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="Notitie (optioneel)"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="input-log-note"
                  />
                </div>
              </div>
            )}

            {goal.type === "room" && goal.metadata && (
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Items</h3>
                  <button
                    onClick={() => setIsAddingItem(!isAddingItem)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                      isAddingItem ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    )}
                    data-testid="button-add-item"
                  >
                    {isAddingItem ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {isAddingItem && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-3 overflow-hidden"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                          placeholder="Nieuwe taak..."
                          className="flex-1 px-3 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          autoFocus
                          data-testid="input-new-item"
                        />
                        <button
                          onClick={handleAddItem}
                          disabled={!newItemTitle.trim()}
                          className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                          data-testid="button-save-item"
                        >
                          Toevoegen
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  {((goal.metadata as any).items as RoomItem[]).map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors group",
                        item.completed ? "bg-emerald-500/10" : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      <button
                        onClick={() => handleToggleRoomItem(idx)}
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                          item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 hover:border-primary"
                        )}
                        data-testid={`detail-item-${idx}`}
                      >
                        {item.completed && <Check className="w-3 h-3" />}
                      </button>
                      <span className={cn(
                        "text-sm flex-1",
                        item.completed && "text-emerald-600 dark:text-emerald-400 line-through"
                      )}>
                        {item.title}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        data-testid={`button-remove-item-${idx}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {goal.type === "roadmap" && goal.metadata && (
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Stappen</h3>
                  <button
                    onClick={() => setIsAddingItem(!isAddingItem)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                      isAddingItem ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    )}
                    data-testid="button-add-step"
                  >
                    {isAddingItem ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {isAddingItem && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-3 overflow-hidden"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                          placeholder="Nieuwe stap..."
                          className="flex-1 px-3 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          autoFocus
                          data-testid="input-new-step"
                        />
                        <button
                          onClick={handleAddItem}
                          disabled={!newItemTitle.trim()}
                          className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                          data-testid="button-save-step"
                        >
                          Toevoegen
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  {((goal.metadata as any).steps as RoadmapStep[]).map((step, idx) => (
                    <div key={idx} className="space-y-1">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors group",
                          step.completed ? "bg-emerald-500/10" : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        <button
                          onClick={() => handleToggleStep(idx)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            step.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 hover:border-primary"
                          )}
                          data-testid={`detail-step-${idx}`}
                        >
                          {step.completed && <Check className="w-3 h-3" />}
                        </button>
                        <span className={cn(
                          "text-sm font-medium flex-1",
                          step.completed && "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {idx + 1}. {step.title}
                        </span>
                        {step.substeps && step.substeps.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {step.substeps.filter(s => s.completed).length}/{step.substeps.length}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                          data-testid={`button-remove-step-${idx}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                      
                      {step.substeps && step.substeps.length > 0 && (
                        <div className="ml-8 space-y-1">
                          {step.substeps.map((substep, subIdx) => (
                            <motion.div
                              key={subIdx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: (idx * 0.03) + (subIdx * 0.02) }}
                              onClick={() => handleToggleStep(idx, subIdx)}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm",
                                substep.completed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
                              )}
                              data-testid={`detail-substep-${idx}-${subIdx}`}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                                substep.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                              )}>
                                {substep.completed && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <span>{substep.title}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {goal.resetPeriod && goal.resetPeriod !== "none" && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {goal.resetPeriod === "weekly" ? "Wekelijks" : "Maandelijks"} doel
                  </span>
                  {goal.periodStartDate && (
                    <Badge variant="outline" className="text-xs">
                      Start: {format(new Date(goal.periodStartDate), "d MMM", { locale: nl })}
                    </Badge>
                  )}
                  {goal.periodStartDate && (
                    <Badge variant="secondary" className="text-xs">
                      Reset: {format(
                        goal.resetPeriod === "weekly" 
                          ? addDays(new Date(goal.periodStartDate), 7)
                          : addMonths(new Date(goal.periodStartDate), 1),
                        "d MMM", 
                        { locale: nl }
                      )}
                    </Badge>
                  )}
                </div>
                <PeriodHistory goalId={goal.id} unit={goal.unit || undefined} />
              </div>
            )}

            {goal.targetDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                <span>Deadline: {format(new Date(goal.targetDate), "d MMMM yyyy", { locale: nl })}</span>
              </div>
            )}

            {logs && logs.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Recente logs</h3>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {logs.slice(0, 10).map((log, idx) => (
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
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border p-4">
              <GoalNotes goalId={goal.id} />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
