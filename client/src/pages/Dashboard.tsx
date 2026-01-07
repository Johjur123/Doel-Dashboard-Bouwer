import { useState } from "react";
import { useGoals, useCreateLog, useUpdateGoal } from "@/hooks/use-goals";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { StatsBar } from "@/components/StatsBar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { GoalDetailSheet } from "@/components/GoalDetailSheet";
import { Confetti, useConfetti } from "@/components/Confetti";
import { Goal, RoadmapStep } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, ChevronDown, ChevronUp, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("lifestyle");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set());
  const [activityOpen, setActivityOpen] = useState(false);
  
  const { data: goals, isLoading } = useGoals();
  const createLog = useCreateLog();
  const updateGoal = useUpdateGoal();
  const confetti = useConfetti();

  const filteredGoals = goals?.filter(g => g.category === activeTab) || [];

  const handleQuickLog = (e: React.MouseEvent, goal: Goal, value: number) => {
    e.stopPropagation();
    createLog.mutate({ 
      goalId: goal.id, 
      value: value,
      note: value > 0 ? "Quick add" : "Quick subtract" 
    });
  };

  const handleToggleStep = (e: React.MouseEvent, goal: Goal, stepIndex: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    
    const metadata = goal.metadata as any;
    const steps = metadata.steps as RoadmapStep[];
    const updatedSteps = [...steps];
    const wasCompleted = updatedSteps[stepIndex].completed;
    updatedSteps[stepIndex].completed = !wasCompleted;
    
    const completedCount = updatedSteps.filter(s => s.completed).length;
    
    updateGoal.mutate({ 
      id: goal.id, 
      currentValue: completedCount,
      metadata: { ...metadata, steps: updatedSteps } 
    });

    if (!wasCompleted && completedCount === steps.length) {
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
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        <StatsBar onActivityClick={() => setActivityOpen(true)} />
        
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="pb-24">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "grid gap-4",
                  activeTab === "lifestyle" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                  activeTab === "savings" && "grid-cols-1 lg:grid-cols-2",
                  activeTab === "business" && "grid-cols-1 max-w-3xl mx-auto",
                  activeTab === "casa" && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
                  activeTab === "milestones" && "grid-cols-1 max-w-2xl mx-auto",
                  activeTab === "fun" && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                )}
              >
                {filteredGoals.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-lg">Geen doelen in deze categorie.</p>
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
                      onToggleExpand={toggleExpanded}
                      onMilestoneToggle={handleMilestoneToggle}
                    />
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <ActivityFeed isOpen={activityOpen} onClose={() => setActivityOpen(false)} />

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
  onToggleStep: (e: React.MouseEvent, goal: Goal, stepIndex: number) => void;
  onToggleExpand: (e: React.MouseEvent, goalId: number) => void;
  onMilestoneToggle: (e: React.MouseEvent, goal: Goal) => void;
}

function GoalCard({ goal, index, expanded, onClick, onQuickLog, onToggleStep, onToggleExpand, onMilestoneToggle }: GoalCardProps) {
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
    return <CasaCard goal={goal} index={index} onClick={onClick} />;
  }
  if (goal.category === 'milestones') {
    return <MilestoneCard goal={goal} index={index} onClick={onClick} onToggle={onMilestoneToggle} />;
  }
  if (goal.category === 'fun') {
    return <FunCard goal={goal} index={index} onClick={onClick} onQuickLog={onQuickLog} />;
  }
  return null;
}

function LifestyleCard({ goal, index, onClick, onQuickLog }: { goal: Goal; index: number; onClick: () => void; onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void }) {
  const percentage = goal.targetValue ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) : 0;
  const isLimit = goal.type === 'counter' && goal.targetValue;
  
  let progressColor = "from-primary to-purple-500";
  let statusText = "";
  if (isLimit) {
    if (percentage > 90) {
      progressColor = "from-red-500 to-rose-600";
      statusText = "Limiet!";
    } else if (percentage > 70) {
      progressColor = "from-orange-400 to-amber-500";
      statusText = "Let op";
    } else {
      progressColor = "from-emerald-400 to-green-500";
      statusText = "Goed bezig";
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="glass-card p-5 flex flex-col justify-between min-h-[180px] cursor-pointer group"
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl shadow-sm"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
          >
            {goal.icon || "✨"}
          </motion.div>
          <div>
            <h3 className="font-display font-bold text-base">{goal.title}</h3>
            {statusText && (
              <span className={cn(
                "text-xs font-medium",
                percentage > 90 ? "text-red-500" : percentage > 70 ? "text-orange-500" : "text-emerald-500"
              )}>
                {statusText}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-display font-bold">
            {goal.currentValue}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              / {goal.targetValue || "∞"} {goal.unit}
            </span>
          </span>
          <div className="flex gap-1">
            <button 
              onClick={(e) => onQuickLog(e, goal, -1)}
              className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors"
              data-testid={`button-minus-${goal.id}`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => onQuickLog(e, goal, 1)}
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              data-testid={`button-plus-${goal.id}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full rounded-full bg-gradient-to-r", progressColor)} 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function SavingsCard({ goal, index, onClick, onQuickLog }: { goal: Goal; index: number; onClick: () => void; onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void }) {
  const percentage = goal.targetValue ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "glass-card p-6 cursor-pointer relative overflow-hidden",
        isComplete && "ring-2 ring-emerald-500/50"
      )}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-center gap-4 mb-6">
        <motion.div 
          className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 p-3 rounded-2xl"
          animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: isComplete ? Infinity : 0, duration: 2 }}
        >
          <span className="text-3xl">{goal.icon || "💰"}</span>
        </motion.div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-xl">{goal.title}</h3>
          <p className={cn(
            "font-medium text-sm",
            isComplete ? "text-emerald-600" : percentage > 75 ? "text-emerald-500" : "text-muted-foreground"
          )}>
            {isComplete ? "Doel bereikt! 🎉" : percentage > 75 ? "Bijna daar!" : "Keep going!"}
          </p>
        </div>
        <button 
          onClick={(e) => onQuickLog(e, goal, 50)}
          className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
          data-testid={`button-add-savings-${goal.id}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-3xl font-display font-bold">
            €{(goal.currentValue || 0).toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            van €{(goal.targetValue || 0).toLocaleString()}
          </span>
        </div>
        
        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden p-0.5">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", bounce: 0, duration: 1.2 }}
          >
            <div className="absolute inset-0 animate-shimmer" />
          </motion.div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(percentage)}% gespaard</span>
          <span>€{((goal.targetValue || 0) - (goal.currentValue || 0)).toLocaleString()} te gaan</span>
        </div>
      </div>
    </motion.div>
  );
}

function BusinessCard({ goal, index, expanded, onClick, onToggleStep, onToggleExpand }: { goal: Goal; index: number; expanded: boolean; onClick: () => void; onToggleStep: (e: React.MouseEvent, goal: Goal, stepIndex: number) => void; onToggleExpand: (e: React.MouseEvent, goalId: number) => void }) {
  const metadata = goal.metadata as any;
  const steps = (metadata?.steps || []) as RoadmapStep[];
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const nextStep = steps.find(s => !s.completed);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden cursor-pointer"
      data-testid={`card-goal-${goal.id}`}
    >
      <div 
        className="p-5 border-b border-border/50"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{goal.icon || "🚀"}</span>
            <div>
              <h3 className="font-display font-bold text-lg">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">{completedSteps} van {steps.length} stappen</p>
            </div>
          </div>
          <div className="relative w-14 h-14">
            <svg className="progress-ring w-14 h-14" viewBox="0 0 56 56">
              <circle
                className="text-secondary"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="24"
                cx="28"
                cy="28"
              />
              <motion.circle
                className="text-blue-500 progress-ring-circle"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="24"
                cx="28"
                cy="28"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 150.8 }}
                animate={{ strokeDashoffset: 150.8 - (150.8 * progress / 100) }}
                style={{ strokeDasharray: 150.8 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-500">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {nextStep && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Volgende: {nextStep.title}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 py-3">
        <button
          onClick={(e) => onToggleExpand(e, goal.id)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
          data-testid={`button-expand-${goal.id}`}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{expanded ? "Verberg stappen" : "Toon alle stappen"}</span>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-2">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={(e) => onToggleStep(e, goal, idx)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer",
                    step.completed 
                      ? "bg-emerald-500/10 border border-emerald-500/20" 
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                  data-testid={`step-${goal.id}-${idx}`}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5",
                    step.completed 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-muted-foreground/30 hover:border-blue-500"
                  )}>
                    {step.completed && <Check className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "text-sm font-medium block",
                      step.completed && "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {idx + 1}. {step.title}
                    </span>
                    {step.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{step.notes}</p>
                    )}
                  </div>
                  {step.blocked && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full">
                      Blocked
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CasaCard({ goal, index, onClick }: { goal: Goal; index: number; onClick: () => void }) {
  const metadata = goal.metadata as any;
  const items = (metadata?.items || []) as { label: string; completed: boolean }[];
  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : (goal.currentValue || 0);
  const isComplete = progress >= 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "glass-card p-4 cursor-pointer flex flex-col items-center text-center aspect-square justify-center relative group",
        isComplete && "ring-2 ring-emerald-500/50"
      )}
      data-testid={`card-goal-${goal.id}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary rounded-t-3xl overflow-hidden">
        <motion.div 
          className={cn(
            "h-full",
            isComplete ? "bg-emerald-500" : "bg-orange-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        />
      </div>

      <motion.div 
        className="text-4xl mb-3"
        animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: isComplete ? Infinity : 0, duration: 2 }}
      >
        {goal.icon || "🏠"}
      </motion.div>
      <h3 className="font-display font-bold text-sm mb-2">{goal.title}</h3>
      <span className={cn(
        "text-xs px-2 py-1 rounded-full font-medium",
        isComplete 
          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400" 
          : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400"
      )}>
        {items.length > 0 ? `${completedCount}/${items.length}` : `${Math.round(progress)}%`}
      </span>
    </motion.div>
  );
}

function MilestoneCard({ goal, index, onClick, onToggle }: { goal: Goal; index: number; onClick: () => void; onToggle: (e: React.MouseEvent, goal: Goal) => void }) {
  const isCompleted = (goal.currentValue || 0) >= 1;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={cn(
        "glass-card p-5 cursor-pointer flex items-center gap-5 relative overflow-hidden",
        isCompleted && "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
      )}
      data-testid={`card-goal-${goal.id}`}
    >
      {isCompleted && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-8 -mt-8" />
      )}
      
      <motion.button
        onClick={(e) => onToggle(e, goal)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-3xl shrink-0 transition-all",
          isCompleted 
            ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-yellow-500/30" 
            : "bg-secondary text-muted-foreground grayscale hover:grayscale-0 hover:bg-secondary/80"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid={`button-toggle-milestone-${goal.id}`}
      >
        {goal.icon || "🏆"}
      </motion.button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-lg truncate">{goal.title}</h3>
          {isCompleted && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold shrink-0"
            >
              VOLTOOID
            </motion.span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {goal.unit || (isCompleted ? "Gefeliciteerd!" : "Nog niet gestart")}
        </p>
      </div>
    </motion.div>
  );
}

function FunCard({ goal, index, onClick, onQuickLog }: { goal: Goal; index: number; onClick: () => void; onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      whileHover={{ scale: 1.03, rotate: 1 }}
      onClick={onClick}
      className="glass-card p-5 flex flex-col items-center justify-center text-center aspect-square cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 relative group"
      data-testid={`card-goal-${goal.id}`}
    >
      <motion.span 
        className="text-4xl mb-3"
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
      >
        {goal.icon || "🎈"}
      </motion.span>
      <h3 className="font-display font-semibold text-sm text-muted-foreground mb-1">{goal.title}</h3>
      <motion.span 
        className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
        key={goal.currentValue}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
      >
        {(goal.currentValue || 0).toLocaleString()}
      </motion.span>
      <span className="text-xs text-purple-500 mt-1 uppercase tracking-wider font-bold">
        {goal.unit}
      </span>
      
      <motion.button
        onClick={(e) => onQuickLog(e, goal, 1)}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/20 text-purple-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        data-testid={`button-plus-${goal.id}`}
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
