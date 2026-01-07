import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGoals, useCreateLog, useUpdateGoal } from "@/hooks/use-goals";
import { GoalDetailSheet } from "@/components/GoalDetailSheet";
import { PixelHouse } from "@/components/PixelHouse";
import { Confetti, useConfetti } from "@/components/Confetti";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { useToast } from "@/hooks/use-toast";
import { Goal, RoadmapStep, RoomItem } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, ChevronDown, ChevronUp, Minus, Sparkles, ArrowLeft, Trash2 } from "lucide-react";
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
  const { toast } = useToast();
  
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
    }, {
      onSuccess: () => {
        toast({
          title: value > 0 ? "Toegevoegd" : "Afgetrokken",
          description: `${Math.abs(value)} ${goal.unit || "eenheden"} ${value > 0 ? "toegevoegd aan" : "afgetrokken van"} ${goal.title}`,
        });
      },
      onError: () => {
        toast({
          title: "Fout",
          description: "Kon wijziging niet opslaan",
          variant: "destructive",
        });
      }
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
    
    const stepTitle = substepIndex !== undefined 
      ? steps[stepIndex].substeps?.[substepIndex]?.title 
      : steps[stepIndex].title;
    const isCompleting = substepIndex !== undefined 
      ? steps[stepIndex].substeps?.[substepIndex]?.completed 
      : steps[stepIndex].completed;
      
    updateGoal.mutate({ 
      id: goal.id, 
      currentValue: completedCount,
      metadata: { ...metadata, steps } 
    }, {
      onSuccess: () => {
        toast({
          title: isCompleting ? "Afgerond" : "Heropend",
          description: stepTitle,
        });
      },
      onError: () => {
        toast({
          title: "Fout",
          description: "Kon wijziging niet opslaan",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleRoomItem = (e: React.MouseEvent, goal: Goal, itemIndex: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    
    const metadata = goal.metadata as any;
    const items = [...(metadata.items as RoomItem[])];
    const wasCompleted = items[itemIndex].completed;
    items[itemIndex].completed = !items[itemIndex].completed;
    
    const completedCount = items.filter(i => i.completed).length;
    
    updateGoal.mutate({ 
      id: goal.id, 
      currentValue: completedCount,
      metadata: { ...metadata, items } 
    }, {
      onSuccess: () => {
        toast({
          title: !wasCompleted ? "Afgerond" : "Heropend",
          description: items[itemIndex].title,
        });
      },
      onError: () => {
        toast({
          title: "Fout",
          description: "Kon wijziging niet opslaan",
          variant: "destructive",
        });
      }
    });

    if (!wasCompleted && completedCount === items.length) {
      confetti.trigger();
    }
  };

  const handleAddRoomItem = (goal: Goal, title: string) => {
    if (!title.trim()) return;
    const metadata = (goal.metadata || {}) as any;
    const items = [...(metadata.items || []), { title: title.trim(), completed: false }];
    updateGoal.mutate({
      id: goal.id,
      targetValue: items.length,
      metadata: { ...metadata, items },
    }, {
      onSuccess: () => {
        toast({ title: "Item toegevoegd", description: title.trim() });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon item niet toevoegen", variant: "destructive" });
      }
    });
  };

  const handleRemoveRoomItem = (e: React.MouseEvent, goal: Goal, itemIndex: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    const metadata = goal.metadata as any;
    const removedTitle = (metadata.items as RoomItem[])[itemIndex]?.title;
    const items = (metadata.items as RoomItem[]).filter((_, i) => i !== itemIndex);
    const completedCount = items.filter(i => i.completed).length;
    updateGoal.mutate({
      id: goal.id,
      currentValue: completedCount,
      targetValue: items.length,
      metadata: { ...metadata, items },
    }, {
      onSuccess: () => {
        toast({ title: "Item verwijderd", description: removedTitle });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon item niet verwijderen", variant: "destructive" });
      }
    });
  };

  const handleAddRoadmapStep = (goal: Goal, title: string) => {
    if (!title.trim()) return;
    const metadata = (goal.metadata || {}) as any;
    const steps = [...(metadata.steps || []), { title: title.trim(), completed: false }];
    updateGoal.mutate({
      id: goal.id,
      targetValue: steps.length,
      metadata: { ...metadata, steps },
    }, {
      onSuccess: () => {
        toast({ title: "Stap toegevoegd", description: title.trim() });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon stap niet toevoegen", variant: "destructive" });
      }
    });
  };

  const handleRemoveRoadmapStep = (e: React.MouseEvent, goal: Goal, stepIndex: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    const metadata = goal.metadata as any;
    const removedTitle = (metadata.steps as RoadmapStep[])[stepIndex]?.title;
    const steps = (metadata.steps as RoadmapStep[]).filter((_, i) => i !== stepIndex);
    const completedCount = steps.filter(s => s.completed).length;
    updateGoal.mutate({
      id: goal.id,
      currentValue: completedCount,
      targetValue: steps.length,
      metadata: { ...metadata, steps },
    }, {
      onSuccess: () => {
        toast({ title: "Stap verwijderd", description: removedTitle });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon stap niet verwijderen", variant: "destructive" });
      }
    });
  };

  const handleAddSubstep = (goal: Goal, stepIndex: number, title: string) => {
    if (!title.trim() || !goal.metadata) return;
    const metadata = goal.metadata as any;
    const steps = [...(metadata.steps as RoadmapStep[])];
    const substeps = [...(steps[stepIndex].substeps || []), { title: title.trim(), completed: false }];
    steps[stepIndex] = { ...steps[stepIndex], substeps };
    updateGoal.mutate({
      id: goal.id,
      metadata: { ...metadata, steps },
    }, {
      onSuccess: () => {
        toast({ title: "Substap toegevoegd", description: title.trim() });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon substap niet toevoegen", variant: "destructive" });
      }
    });
  };

  const handleRemoveSubstep = (e: React.MouseEvent, goal: Goal, stepIndex: number, substepIndex: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    const metadata = goal.metadata as any;
    const removedTitle = (metadata.steps as RoadmapStep[])[stepIndex]?.substeps?.[substepIndex]?.title;
    const steps = [...(metadata.steps as RoadmapStep[])];
    const substeps = steps[stepIndex].substeps?.filter((_, i) => i !== substepIndex) || [];
    steps[stepIndex] = { ...steps[stepIndex], substeps };
    updateGoal.mutate({
      id: goal.id,
      metadata: { ...metadata, steps },
    }, {
      onSuccess: () => {
        toast({ title: "Substap verwijderd", description: removedTitle });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon substap niet verwijderen", variant: "destructive" });
      }
    });
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
    updateGoal.mutate({ id: goal.id, currentValue: newValue }, {
      onSuccess: () => {
        toast({
          title: newValue === 1 ? "Mijlpaal behaald!" : "Mijlpaal heropend",
          description: goal.title,
        });
      },
      onError: () => {
        toast({
          title: "Fout",
          description: "Kon mijlpaal niet bijwerken",
          variant: "destructive",
        });
      }
    });
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
          <div className="flex items-center gap-2">
            <CreateGoalDialog category={category} />
            <ThemeToggle />
          </div>
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
                        onAddRoomItem={handleAddRoomItem}
                        onRemoveRoomItem={handleRemoveRoomItem}
                        onAddRoadmapStep={handleAddRoadmapStep}
                        onRemoveRoadmapStep={handleRemoveRoadmapStep}
                        onAddSubstep={handleAddSubstep}
                        onRemoveSubstep={handleRemoveSubstep}
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
  onAddRoomItem: (goal: Goal, title: string) => void;
  onRemoveRoomItem: (e: React.MouseEvent, goal: Goal, itemIndex: number) => void;
  onAddRoadmapStep: (goal: Goal, title: string) => void;
  onRemoveRoadmapStep: (e: React.MouseEvent, goal: Goal, stepIndex: number) => void;
  onAddSubstep: (goal: Goal, stepIndex: number, title: string) => void;
  onRemoveSubstep: (e: React.MouseEvent, goal: Goal, stepIndex: number, substepIndex: number) => void;
}

function GoalCard({ goal, index, expanded, onClick, onQuickLog, onToggleStep, onToggleRoomItem, onToggleExpand, onMilestoneToggle, onAddRoomItem, onRemoveRoomItem, onAddRoadmapStep, onRemoveRoadmapStep, onAddSubstep, onRemoveSubstep }: GoalCardProps) {
  if (goal.category === 'lifestyle') {
    return <LifestyleCard goal={goal} index={index} onClick={onClick} onQuickLog={onQuickLog} />;
  }
  if (goal.category === 'savings') {
    return <SavingsCard goal={goal} index={index} onClick={onClick} onQuickLog={onQuickLog} />;
  }
  if (goal.category === 'business') {
    return <BusinessCard goal={goal} index={index} expanded={expanded} onClick={onClick} onToggleStep={onToggleStep} onToggleExpand={onToggleExpand} onAddStep={onAddRoadmapStep} onRemoveStep={onRemoveRoadmapStep} onAddSubstep={onAddSubstep} onRemoveSubstep={onRemoveSubstep} />;
  }
  if (goal.category === 'casa') {
    return <CasaCard goal={goal} index={index} expanded={expanded} onClick={onClick} onToggleRoomItem={onToggleRoomItem} onToggleExpand={onToggleExpand} onAddItem={onAddRoomItem} onRemoveItem={onRemoveRoomItem} />;
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
  const isComplete = percentage >= 100;
  
  let progressGradient = "from-primary to-primary/80";
  let statusColor = "text-primary";
  if (isLimit) {
    if (percentage > 90) {
      progressGradient = "from-red-500 to-red-400";
      statusColor = "text-red-500";
    } else if (percentage > 70) {
      progressGradient = "from-amber-500 to-orange-400";
      statusColor = "text-amber-500";
    } else {
      progressGradient = "from-emerald-500 to-teal-400";
      statusColor = "text-emerald-500";
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="glass-card p-4 cursor-pointer group"
      whileHover={{ y: -2 }}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div 
          className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-xl"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {goal.icon || "✨"}
        </motion.div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm block truncate">{goal.title}</span>
          <span className="text-xs text-muted-foreground">{goal.unit}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-1">
          <span className={cn("text-2xl font-bold tabular-nums", statusColor)}>
            {goal.currentValue}
          </span>
          <span className="text-sm text-muted-foreground">/ {goal.targetValue}</span>
        </div>
        <div className="flex gap-1.5">
          <motion.button 
            onClick={(e) => onQuickLog(e, goal, -1)}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--destructive) / 0.2)" }}
            whileTap={{ scale: 0.95 }}
            data-testid={`button-minus-${goal.id}`}
          >
            <Minus className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button 
            onClick={(e) => onQuickLog(e, goal, 1)}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-testid={`button-plus-${goal.id}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
      
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-full bg-gradient-to-r", progressGradient)} 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      
      {isComplete && !isLimit && (
        <motion.div 
          className="mt-2 text-xs text-center text-emerald-600 dark:text-emerald-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Doel bereikt!
        </motion.div>
      )}
    </motion.div>
  );
}

function SavingsCard({ goal, index, onClick, onQuickLog }: { goal: Goal; index: number; onClick: () => void; onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void }) {
  const percentage = goal.targetValue ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) : 0;
  const remaining = Math.max(0, (goal.targetValue || 0) - (goal.currentValue || 0));
  const isComplete = remaining === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className={cn(
        "glass-card p-5 cursor-pointer group",
        isComplete && "ring-2 ring-emerald-500/30"
      )}
      whileHover={{ y: -2 }}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {goal.icon || "✨"}
          </motion.div>
          <div>
            <span className="font-semibold block">{goal.title}</span>
            {isComplete && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Doel bereikt!</span>
            )}
          </div>
        </div>
        <motion.button 
          onClick={(e) => onQuickLog(e, goal, 50)}
          className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ boxShadow: "0 4px 14px -3px rgba(16, 185, 129, 0.4)" }}
          data-testid={`button-add-savings-${goal.id}`}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">€{(goal.currentValue || 0).toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">van €{(goal.targetValue || 0).toLocaleString()}</span>
        </div>
        
        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
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

function BusinessCard({ goal, index, expanded, onClick, onToggleStep, onToggleExpand, onAddStep, onRemoveStep, onAddSubstep, onRemoveSubstep }: { 
  goal: Goal; 
  index: number; 
  expanded: boolean; 
  onClick: () => void; 
  onToggleStep: (e: React.MouseEvent, goal: Goal, stepIndex: number, substepIndex?: number) => void; 
  onToggleExpand: (e: React.MouseEvent, goalId: number) => void;
  onAddStep: (goal: Goal, title: string) => void;
  onRemoveStep: (e: React.MouseEvent, goal: Goal, stepIndex: number) => void;
  onAddSubstep: (goal: Goal, stepIndex: number, title: string) => void;
  onRemoveSubstep: (e: React.MouseEvent, goal: Goal, stepIndex: number, substepIndex: number) => void;
}) {
  const [newStepTitle, setNewStepTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addingSubstepFor, setAddingSubstepFor] = useState<number | null>(null);
  const [newSubstepTitle, setNewSubstepTitle] = useState("");
  
  const metadata = goal.metadata as any;
  const steps = (metadata?.steps || []) as RoadmapStep[];
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newStepTitle.trim()) {
      onAddStep(goal, newStepTitle);
      setNewStepTitle("");
      setIsAdding(false);
    }
  };

  const handleAddSubstep = (e: React.MouseEvent, stepIndex: number) => {
    e.stopPropagation();
    if (newSubstepTitle.trim()) {
      onAddSubstep(goal, stepIndex, newSubstepTitle);
      setNewSubstepTitle("");
      setAddingSubstepFor(null);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      className="glass-card overflow-hidden"
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="p-5 cursor-pointer" onClick={onClick}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {goal.icon || "✨"}
            </motion.div>
            <div>
              <h3 className="font-semibold">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">{completedSteps}/{steps.length} stappen voltooid</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-500">{Math.round(progress)}%</span>
          </div>
        </div>
        
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="border-t border-border/50">
        <motion.button
          onClick={(e) => onToggleExpand(e, goal.id)}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm text-muted-foreground transition-colors"
          whileHover={{ backgroundColor: "hsl(var(--secondary) / 0.5)" }}
          data-testid={`button-expand-${goal.id}`}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{expanded ? "Verberg stappen" : "Toon stappen"}</span>
        </motion.button>
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
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors group",
                      step.completed ? "bg-emerald-500/10" : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <button
                      onClick={(e) => onToggleStep(e, goal, idx)}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        step.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                      )}
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
                      onClick={(e) => { e.stopPropagation(); setAddingSubstepFor(addingSubstepFor === idx ? null : idx); }}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      data-testid={`button-add-substep-${goal.id}-${idx}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onRemoveStep(e, goal, idx)}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      data-testid={`button-remove-step-${goal.id}-${idx}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                  
                  <div className="ml-8 space-y-1">
                    {step.substeps && step.substeps.map((substep, subIdx) => (
                      <motion.div
                        key={subIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (idx * 0.03) + (subIdx * 0.02) }}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded transition-colors text-sm group/sub",
                          substep.completed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <button
                          onClick={(e) => onToggleStep(e, goal, idx, subIdx)}
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                            substep.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                          )}
                        >
                          {substep.completed && <Check className="w-2.5 h-2.5" />}
                        </button>
                        <span className="flex-1">{substep.title}</span>
                        <button
                          onClick={(e) => onRemoveSubstep(e, goal, idx, subIdx)}
                          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/sub:opacity-100 transition-all"
                          data-testid={`button-remove-substep-${goal.id}-${idx}-${subIdx}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    
                    <AnimatePresence>
                      {addingSubstepFor === idx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={newSubstepTitle}
                            onChange={(e) => setNewSubstepTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddSubstep(e as any, idx);
                              if (e.key === "Escape") setAddingSubstepFor(null);
                            }}
                            placeholder="Nieuwe substap..."
                            className="flex-1 px-2 py-1 rounded bg-secondary border-0 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`input-new-substep-${goal.id}-${idx}`}
                          />
                          <button
                            onClick={(e) => handleAddSubstep(e, idx)}
                            disabled={!newSubstepTitle.trim()}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium disabled:opacity-50 hover:bg-blue-600 transition-colors"
                            data-testid={`button-save-substep-${goal.id}-${idx}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
              
              <AnimatePresence>
                {isAdding ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 pt-2"
                  >
                    <input
                      type="text"
                      value={newStepTitle}
                      onChange={(e) => setNewStepTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd(e as any);
                        if (e.key === "Escape") setIsAdding(false);
                      }}
                      placeholder="Nieuwe stap..."
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`input-new-step-${goal.id}`}
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!newStepTitle.trim()}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-600 transition-colors"
                      data-testid={`button-save-step-${goal.id}`}
                    >
                      Toevoegen
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                    className="flex items-center gap-2 w-full p-2 rounded-lg text-sm text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                    data-testid={`button-add-step-${goal.id}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Stap toevoegen</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CasaCard({ goal, index, expanded, onClick, onToggleRoomItem, onToggleExpand, onAddItem, onRemoveItem }: { 
  goal: Goal; 
  index: number; 
  expanded: boolean; 
  onClick: () => void; 
  onToggleRoomItem: (e: React.MouseEvent, goal: Goal, itemIndex: number) => void; 
  onToggleExpand: (e: React.MouseEvent, goalId: number) => void;
  onAddItem: (goal: Goal, title: string) => void;
  onRemoveItem: (e: React.MouseEvent, goal: Goal, itemIndex: number) => void;
}) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const metadata = goal.metadata as any;
  const items = (metadata?.items || []) as RoomItem[];
  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const isComplete = progress >= 100;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newItemTitle.trim()) {
      onAddItem(goal, newItemTitle);
      setNewItemTitle("");
      setIsAdding(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "glass-card overflow-hidden cursor-pointer",
        isComplete && "ring-2 ring-emerald-500/30"
      )}
      whileHover={{ scale: 1.02 }}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="p-5" onClick={(e) => onToggleExpand(e, goal.id)}>
        <div className="flex flex-col items-center text-center">
          <motion.div 
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3",
              isComplete ? "bg-emerald-500/10" : "bg-orange-500/10"
            )}
            animate={isComplete ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: isComplete ? Infinity : 0, duration: 2 }}
          >
            {goal.icon || "✨"}
          </motion.div>
          <h3 className="font-semibold mb-2">{goal.title}</h3>
          <span className={cn(
            "text-xs font-semibold px-3 py-1 rounded-full",
            isComplete 
              ? "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-400" 
              : "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 text-orange-700 dark:text-orange-400"
          )}>
            {completedCount}/{items.length} items
          </span>
        </div>
        
        <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full rounded-full bg-gradient-to-r", isComplete ? "from-emerald-500 to-teal-400" : "from-orange-500 to-amber-400")}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
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
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-colors text-sm group",
                    item.completed ? "bg-emerald-500/10" : "hover:bg-secondary"
                  )}
                >
                  <button
                    onClick={(e) => onToggleRoomItem(e, goal, idx)}
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                    )}
                  >
                    {item.completed && <Check className="w-2.5 h-2.5" />}
                  </button>
                  <span className={cn(
                    "flex-1 truncate",
                    item.completed && "text-emerald-600 dark:text-emerald-400 line-through"
                  )}>
                    {item.title}
                  </span>
                  <button
                    onClick={(e) => onRemoveItem(e, goal, idx)}
                    className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    data-testid={`button-remove-item-${goal.id}-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
              
              <AnimatePresence>
                {isAdding ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd(e as any);
                        if (e.key === "Escape") setIsAdding(false);
                      }}
                      placeholder="Nieuw item..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`input-new-item-${goal.id}`}
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!newItemTitle.trim()}
                      className="px-2.5 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-orange-600 transition-colors"
                      data-testid={`button-save-item-${goal.id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                    className="flex items-center justify-center gap-1 w-full p-1.5 rounded-lg text-xs text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                    data-testid={`button-add-item-${goal.id}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Toevoegen</span>
                  </motion.button>
                )}
              </AnimatePresence>
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
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className={cn(
        "glass-card p-4 cursor-pointer flex items-center gap-4",
        isCompleted && "ring-2 ring-amber-500/30"
      )}
      whileHover={{ x: 4 }}
      data-testid={`card-goal-${goal.id}`}
    >
      <motion.button
        onClick={(e) => onToggle(e, goal)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all",
          isCompleted 
            ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg" 
            : "bg-secondary/80 grayscale hover:grayscale-0"
        )}
        whileHover={{ scale: 1.1, rotate: isCompleted ? 5 : 0 }}
        whileTap={{ scale: 0.9 }}
        style={isCompleted ? { boxShadow: "0 8px 20px -4px rgba(245, 158, 11, 0.4)" } : {}}
        data-testid={`button-toggle-milestone-${goal.id}`}
      >
        {goal.icon || "✨"}
      </motion.button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold">{goal.title}</h3>
          {isCompleted && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-semibold shrink-0"
            >
              Behaald
            </motion.span>
          )}
        </div>
        {goal.unit && (
          <p className="text-sm text-muted-foreground mt-0.5">{goal.unit}</p>
        )}
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.div>
  );
}

function FunCard({ goal, index, onClick }: { goal: Goal; index: number; onClick: () => void }) {
  const relationshipStart = new Date(2025, 9, 2);
  const isAutoCalculated = goal.title.toLowerCase().includes("dagen samen");
  const displayValue = isAutoCalculated 
    ? differenceInDays(new Date(), relationshipStart)
    : (goal.currentValue || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      onClick={onClick}
      className="glass-card p-5 flex flex-col items-center text-center cursor-pointer group"
      whileHover={{ scale: 1.02, y: -2 }}
      data-testid={`card-goal-${goal.id}`}
    >
      <motion.div 
        className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay: index * 0.3, ease: "easeInOut" }}
      >
        <span className="text-2xl">{goal.icon || "✨"}</span>
      </motion.div>
      <motion.span 
        className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent tabular-nums"
        key={displayValue}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
      <span className="text-sm text-muted-foreground mt-1">{goal.unit}</span>
      <span className="text-sm font-medium mt-3 truncate w-full">{goal.title}</span>
    </motion.div>
  );
}
