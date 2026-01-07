import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGoals, useCreateLog, useUpdateGoal } from "@/hooks/use-goals";
import { GoalDetailSheet } from "@/components/GoalDetailSheet";
import { PixelHouse } from "@/components/PixelHouse";
import { Confetti, useConfetti } from "@/components/Confetti";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Goal, RoadmapStep, RoomItem } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, ChevronDown, ChevronUp, Minus, Sparkles, ArrowLeft, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

const categoryInfo: Record<string, { label: string; color: string; gradient: string }> = {
  lifestyle: { label: "Lifestyle", color: "text-rose-500", gradient: "from-rose-500 to-pink-500" },
  savings: { label: "Sparen", color: "text-emerald-500", gradient: "from-emerald-500 to-teal-500" },
  business: { label: "Business", color: "text-blue-500", gradient: "from-blue-500 to-indigo-500" },
  casa: { label: "Casa Hörnig", color: "text-orange-500", gradient: "from-orange-500 to-amber-500" },
  milestones: { label: "Mijlpalen", color: "text-yellow-500", gradient: "from-yellow-500 to-orange-500" },
  fun: { label: "Fun", color: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
};

export default function Dashboard() {
  const params = useParams<{ category: string }>();
  const category = params.category || "lifestyle";
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set());
  
  const { data: goals, isLoading } = useGoals();
  const createLog = useCreateLog();
  const updateGoal = useUpdateGoal();
  const confetti = useConfetti();

  const filteredGoals = goals?.filter(g => g.category === category) || [];
  const casaGoals = goals?.filter(g => g.category === "casa") || [];
  const casaProgress = casaGoals.length > 0 
    ? casaGoals.reduce((sum, g) => sum + (g.currentValue || 0), 0) / casaGoals.reduce((sum, g) => sum + (g.targetValue || 100), 0) * 100
    : 0;

  const info = categoryInfo[category] || categoryInfo.lifestyle;

  const handleQuickLog = (e: React.MouseEvent, goal: Goal, value: number) => {
    e.stopPropagation();
    createLog.mutate({ 
      goalId: goal.id, 
      value: value,
      note: value > 0 ? "Quick add" : "Quick subtract" 
    });
  };

  const handleToggleStep = (e: React.MouseEvent, goal: Goal, stepIndex: number, substepIndex?: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    
    const metadata = goal.metadata as any;
    const steps = [...(metadata.steps as RoadmapStep[])];
    
    if (substepIndex !== undefined && steps[stepIndex].substeps) {
      const substeps = [...steps[stepIndex].substeps!];
      substeps[substepIndex].completed = !substeps[substepIndex].completed;
      steps[stepIndex].substeps = substeps;
      
      const allSubstepsComplete = substeps.every(s => s.completed);
      if (allSubstepsComplete && !steps[stepIndex].completed) {
        steps[stepIndex].completed = true;
      }
    } else {
      steps[stepIndex].completed = !steps[stepIndex].completed;
    }
    
    const completedCount = steps.filter(s => s.completed).length;
    
    updateGoal.mutate({ 
      id: goal.id, 
      currentValue: completedCount,
      metadata: { ...metadata, steps } 
    });
  };

  const handleToggleRoomItem = (e: React.MouseEvent, goal: Goal, itemIndex: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    
    const metadata = goal.metadata as any;
    const items = [...(metadata.items as RoomItem[])];
    items[itemIndex].completed = !items[itemIndex].completed;
    
    const completedCount = items.filter(i => i.completed).length;
    
    updateGoal.mutate({ 
      id: goal.id, 
      currentValue: completedCount,
      metadata: { ...metadata, items } 
    });

    if (!items[itemIndex].completed === false && completedCount === items.length) {
      confetti.trigger();
    }
  };

  const toggleExpanded = (e: React.MouseEvent, goalId: number) => {
    e.stopPropagation();
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  const handleMilestoneToggle = (e: React.MouseEvent, goal: Goal) => {
    e.stopPropagation();
    const newValue = (goal.currentValue || 0) >= 1 ? 0 : 1;
    updateGoal.mutate({ id: goal.id, currentValue: newValue });
    if (newValue === 1) {
      confetti.trigger();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Confetti active={confetti.isActive} onComplete={confetti.reset} />
      
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className={cn("text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent", info.gradient)}>
              {info.label}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <main className="pb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {category === "casa" && (
                  <div className="mb-8 flex justify-center">
                    <PixelHouse progress={casaProgress} className="w-48 h-48" />
                  </div>
                )}
                
                <div className={cn(
                  "grid gap-4",
                  category === "lifestyle" && "grid-cols-1 sm:grid-cols-2",
                  category === "savings" && "grid-cols-1 md:grid-cols-2",
                  category === "business" && "grid-cols-1",
                  category === "casa" && "grid-cols-2 md:grid-cols-3",
                  category === "milestones" && "grid-cols-1",
                  category === "fun" && "grid-cols-2 md:grid-cols-4"
                )}>
                  {filteredGoals.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground">Geen doelen in deze categorie.</p>
                    </div>
                  ) : (
                    filteredGoals.map((goal, index) => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal}
                        index={index}
                        expanded={expandedGoals.has(goal.id)}
                        onClick={() => setSelectedGoal(goal)}
                        onQuickLog={handleQuickLog}
                        onToggleStep={handleToggleStep}
                        onToggleRoomItem={handleToggleRoomItem}
                        onToggleExpand={toggleExpanded}
                        onMilestoneToggle={handleMilestoneToggle}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <GoalDetailSheet 
        goal={selectedGoal} 
        open={!!selectedGoal} 
        onOpenChange={(open) => !open && setSelectedGoal(null)} 
      />
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  index: number;
  expanded: boolean;
  onClick: () => void;
  onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void;
  onToggleStep: (e: React.MouseEvent, goal: Goal, stepIndex: number, substepIndex?: number) => void;
  onToggleRoomItem: (e: React.MouseEvent, goal: Goal, itemIndex: number) => void;
  onToggleExpand: (e: React.MouseEvent, goalId: number) => void;
  onMilestoneToggle: (e: React.MouseEvent, goal: Goal) => void;
}

function GoalCard({ goal, index, expanded, onClick, onQuickLog, onToggleStep, onToggleRoomItem, onToggleExpand, onMilestoneToggle }: GoalCardProps) {
  if (goal.category === 'lifestyle') {
    return <LifestyleCard goal={goal} index={index} onClick={onClick} onQuickLog={onQuickLog} />;
  }
  if (goal.category === 'savings') {
    return <SavingsCard goal={goal} index={index} onClick={onClick} onQuickLog={onQuickLog} />;
  }
  if (goal.category === 'business') {
    return <BusinessCard goal={goal} index={index} expanded={expanded} onClick={onClick} onToggleStep={onToggleStep} onToggleExpand={onToggleExpand} />;
  }
  if (goal.category === 'casa') {
    return <CasaCard goal={goal} index={index} expanded={expanded} onClick={onClick} onToggleRoomItem={onToggleRoomItem} onToggleExpand={onToggleExpand} />;
  }
  if (goal.category === 'milestones') {
    return <MilestoneCard goal={goal} index={index} onClick={onClick} onToggle={onMilestoneToggle} />;
  }
  if (goal.category === 'fun') {
    return <FunCard goal={goal} index={index} onClick={onClick} />;
  }
  return null;
}

function LifestyleCard({ goal, index, onClick, onQuickLog }: { goal: Goal; index: number; onClick: () => void; onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void }) {
  const percentage = goal.targetValue ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) : 0;
  const isLimit = goal.type === 'counter' && goal.targetValue;
  
  let progressColor = "bg-primary";
  if (isLimit) {
    if (percentage > 90) progressColor = "bg-red-500";
    else if (percentage > 70) progressColor = "bg-orange-400";
    else progressColor = "bg-emerald-500";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-card rounded-2xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-colors"
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{goal.icon || "✨"}</span>
        <span className="font-medium text-sm flex-1 truncate">{goal.title}</span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl font-bold tabular-nums">
          {goal.currentValue}
          <span className="text-sm font-normal text-muted-foreground">/{goal.targetValue} {goal.unit}</span>
        </span>
        <div className="flex gap-1">
          <button 
            onClick={(e) => onQuickLog(e, goal, -1)}
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors"
            data-testid={`button-minus-${goal.id}`}
          >
            <Minus className="w-3 h-3" />
          </button>
          <button 
            onClick={(e) => onQuickLog(e, goal, 1)}
            className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            data-testid={`button-plus-${goal.id}`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-full", progressColor)} 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

function SavingsCard({ goal, index, onClick, onQuickLog }: { goal: Goal; index: number; onClick: () => void; onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void }) {
  const percentage = goal.targetValue ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-card rounded-2xl border border-border p-5 cursor-pointer hover:border-emerald-500/30 transition-colors"
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.icon || "💰"}</span>
          <span className="font-semibold">{goal.title}</span>
        </div>
        <button 
          onClick={(e) => onQuickLog(e, goal, 50)}
          className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
          data-testid={`button-add-savings-${goal.id}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold">€{(goal.currentValue || 0).toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">van €{(goal.targetValue || 0).toLocaleString()}</span>
        </div>
        
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(percentage)}%</span>
          <span>€{((goal.targetValue || 0) - (goal.currentValue || 0)).toLocaleString()} te gaan</span>
        </div>
      </div>
    </motion.div>
  );
}

function BusinessCard({ goal, index, expanded, onClick, onToggleStep, onToggleExpand }: { goal: Goal; index: number; expanded: boolean; onClick: () => void; onToggleStep: (e: React.MouseEvent, goal: Goal, stepIndex: number, substepIndex?: number) => void; onToggleExpand: (e: React.MouseEvent, goalId: number) => void }) {
  const metadata = goal.metadata as any;
  const steps = (metadata?.steps || []) as RoadmapStep[];
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="p-4 cursor-pointer" onClick={onClick}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goal.icon || "🚀"}</span>
            <div>
              <h3 className="font-semibold">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">{completedSteps}/{steps.length} stappen</p>
            </div>
          </div>
          <span className="text-lg font-bold text-blue-500">{Math.round(progress)}%</span>
        </div>
        
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="border-t border-border">
        <button
          onClick={(e) => onToggleExpand(e, goal.id)}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          data-testid={`button-expand-${goal.id}`}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{expanded ? "Verberg" : "Toon stappen"}</span>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={(e) => onToggleStep(e, goal, idx)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      step.completed ? "bg-emerald-500/10" : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      step.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                    )}>
                      {step.completed && <Check className="w-3 h-3" />}
                    </div>
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
                  </motion.div>
                  
                  {step.substeps && step.substeps.length > 0 && (
                    <div className="ml-8 space-y-1">
                      {step.substeps.map((substep, subIdx) => (
                        <motion.div
                          key={subIdx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: (idx * 0.03) + (subIdx * 0.02) }}
                          onClick={(e) => onToggleStep(e, goal, idx, subIdx)}
                          className={cn(
                            "flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-sm",
                            substep.completed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
                          )}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CasaCard({ goal, index, expanded, onClick, onToggleRoomItem, onToggleExpand }: { goal: Goal; index: number; expanded: boolean; onClick: () => void; onToggleRoomItem: (e: React.MouseEvent, goal: Goal, itemIndex: number) => void; onToggleExpand: (e: React.MouseEvent, goalId: number) => void }) {
  const metadata = goal.metadata as any;
  const items = (metadata?.items || []) as RoomItem[];
  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const isComplete = progress >= 100;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-2xl border overflow-hidden cursor-pointer",
        isComplete ? "border-emerald-500/50" : "border-border hover:border-orange-500/30"
      )}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="p-4" onClick={(e) => onToggleExpand(e, goal.id)}>
        <div className="flex flex-col items-center text-center">
          <motion.span 
            className="text-3xl mb-2"
            animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: isComplete ? Infinity : 0, duration: 2 }}
          >
            {goal.icon || "🏠"}
          </motion.span>
          <h3 className="font-semibold text-sm mb-1">{goal.title}</h3>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isComplete 
              ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400" 
              : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400"
          )}>
            {completedCount}/{items.length}
          </span>
        </div>
        
        <div className="mt-3 h-1 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full rounded-full", isComplete ? "bg-emerald-500" : "bg-orange-500")}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-3 space-y-1.5">
              {items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={(e) => onToggleRoomItem(e, goal, idx)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm",
                    item.completed ? "bg-emerald-500/10" : "hover:bg-secondary"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                  )}>
                    {item.completed && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className={cn(
                    "flex-1 truncate",
                    item.completed && "text-emerald-600 dark:text-emerald-400 line-through"
                  )}>
                    {item.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MilestoneCard({ goal, index, onClick, onToggle }: { goal: Goal; index: number; onClick: () => void; onToggle: (e: React.MouseEvent, goal: Goal) => void }) {
  const isCompleted = (goal.currentValue || 0) >= 1;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl border p-4 cursor-pointer flex items-center gap-4",
        isCompleted ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10" : "border-border hover:border-primary/30"
      )}
      data-testid={`card-goal-${goal.id}`}
    >
      <motion.button
        onClick={(e) => onToggle(e, goal)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all",
          isCompleted 
            ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md" 
            : "bg-secondary grayscale hover:grayscale-0"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid={`button-toggle-milestone-${goal.id}`}
      >
        {goal.icon || "🏆"}
      </motion.button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{goal.title}</h3>
          {isCompleted && (
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium shrink-0">
              Done
            </span>
          )}
        </div>
        {goal.unit && (
          <p className="text-sm text-muted-foreground truncate">{goal.unit}</p>
        )}
      </div>
    </motion.div>
  );
}

function FunCard({ goal, index, onClick }: { goal: Goal; index: number; onClick: () => void }) {
  const relationshipStart = new Date(2020, 9, 2);
  const isAutoCalculated = goal.title.toLowerCase().includes("dagen samen");
  const displayValue = isAutoCalculated 
    ? differenceInDays(new Date(), relationshipStart)
    : (goal.currentValue || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      onClick={onClick}
      className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center text-center cursor-pointer hover:border-purple-500/30 transition-colors group"
      data-testid={`card-goal-${goal.id}`}
    >
      <motion.span 
        className="text-3xl mb-2"
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay: index * 0.3 }}
      >
        {goal.icon || "🎈"}
      </motion.span>
      <motion.span 
        className="text-3xl font-bold text-purple-600 dark:text-purple-400 tabular-nums"
        key={displayValue}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
      <span className="text-xs text-muted-foreground mt-1">{goal.unit}</span>
      <span className="text-xs font-medium text-muted-foreground mt-2 truncate w-full">{goal.title}</span>
    </motion.div>
  );
}
