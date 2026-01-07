import { useState } from "react";
import { useGoals, useCreateLog, useUpdateGoal } from "@/hooks/use-goals";
import { Navigation } from "@/components/Navigation";
import { GoalDetailSheet } from "@/components/GoalDetailSheet";
import { Goal, RoadmapStep, RoomChecklist } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, MoreHorizontal, ArrowRight, Home as HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("lifestyle");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  const { data: goals, isLoading } = useGoals();
  const createLog = useCreateLog();
  const updateGoal = useUpdateGoal();

  const filteredGoals = goals?.filter(g => g.category === activeTab) || [];

  const handleQuickLog = (e: React.MouseEvent, goal: Goal, value: number) => {
    e.stopPropagation();
    createLog.mutate({ 
      goalId: goal.id, 
      value: value,
      note: "Quick log" 
    });
  };

  const handleToggleStep = (e: React.MouseEvent, goal: Goal, stepIndex: number) => {
    e.stopPropagation();
    if (!goal.metadata) return;
    
    const metadata = goal.metadata as any;
    const steps = metadata.steps as RoadmapStep[];
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].completed = !updatedSteps[stepIndex].completed;
    
    updateGoal.mutate({ 
      id: goal.id, 
      metadata: { ...metadata, steps: updatedSteps } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                "grid gap-6",
                activeTab === "lifestyle" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                activeTab === "savings" && "grid-cols-1 lg:grid-cols-2",
                activeTab === "business" && "grid-cols-1 max-w-3xl mx-auto",
                activeTab === "casa" && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
                activeTab === "milestones" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-1",
                activeTab === "fun" && "grid-cols-2 md:grid-cols-3"
              )}
            >
              {filteredGoals.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground text-lg">Geen doelen gevonden in deze categorie.</p>
                </div>
              ) : (
                filteredGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onClick={() => setSelectedGoal(goal)}
                    onQuickLog={handleQuickLog}
                    onToggleStep={handleToggleStep}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <GoalDetailSheet 
        goal={selectedGoal} 
        open={!!selectedGoal} 
        onOpenChange={(open) => !open && setSelectedGoal(null)} 
      />
    </div>
  );
}

// --- SUB-COMPONENTS FOR SPECIFIC GOAL TYPES ---

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
  onQuickLog: (e: React.MouseEvent, goal: Goal, value: number) => void;
  onToggleStep: (e: React.MouseEvent, goal: Goal, stepIndex: number) => void;
}

function GoalCard({ goal, onClick, onQuickLog, onToggleStep }: GoalCardProps) {
  // 1. Lifestyle: Habit Cards
  if (goal.category === 'lifestyle') {
    const isLimit = goal.type === 'counter' && goal.targetValue;
    const percentage = goal.targetValue ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) : 0;
    
    // Determine color state based on limits (if defined)
    let progressColor = "bg-primary";
    if (isLimit) {
      if (percentage > 90) progressColor = "bg-red-500";
      else if (percentage > 70) progressColor = "bg-orange-500";
      else progressColor = "bg-emerald-500";
    }

    return (
      <motion.div 
        whileHover={{ y: -4, scale: 1.01 }}
        onClick={onClick}
        className="glass-card p-6 flex flex-col justify-between h-[200px] cursor-pointer group"
      >
        <div className="flex justify-between items-start">
          <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            {goal.icon || "✨"}
          </div>
          <button 
            onClick={(e) => onQuickLog(e, goal, 1)}
            className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div>
          <h3 className="font-display font-bold text-xl mb-1">{goal.title}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {goal.currentValue} / {goal.targetValue || "∞"} {goal.unit}
          </p>
          
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full rounded-full", progressColor)} 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1 }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. Savings: Large Progress Bars
  if (goal.category === 'savings') {
    const percentage = goal.targetValue ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100) : 0;
    
    return (
      <motion.div 
        whileHover={{ y: -4 }}
        onClick={onClick}
        className="glass-card p-8 cursor-pointer relative overflow-hidden"
      >
        {/* Background gradient decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-center gap-4 mb-6">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
            <span className="text-3xl">{goal.icon || "💰"}</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl">{goal.title}</h3>
            <p className="text-emerald-600 font-medium">
              {percentage >= 100 ? "Doel bereikt! 🎉" : percentage > 75 ? "Bijna daar!" : "Keep going!"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-display font-bold text-slate-700">€{goal.currentValue?.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground mb-1">van €{goal.targetValue?.toLocaleString()}</span>
          </div>
          
          <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1.5 }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // 3. Business: Roadmap / Accordion
  if (goal.category === 'business') {
    const metadata = goal.metadata as any;
    const steps = (metadata?.steps || []) as RoadmapStep[];
    const completedSteps = steps.filter(s => s.completed).length;
    const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

    return (
      <motion.div 
        layout
        onClick={onClick}
        className="glass-card overflow-hidden cursor-pointer border-l-4 border-l-blue-500"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.icon || "🚀"}</span>
              <div>
                <h3 className="font-display font-bold text-lg">{goal.title}</h3>
                <p className="text-xs text-muted-foreground">{completedSteps} van {steps.length} stappen</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center font-bold text-xs text-blue-600">
              {Math.round(progress)}%
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {steps.slice(0, 3).map((step, idx) => (
              <div 
                key={idx} 
                onClick={(e) => onToggleStep(e, goal, idx)}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  step.completed ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 group-hover:border-blue-400"
                )}>
                  {step.completed && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={cn(
                  "text-sm",
                  step.completed ? "text-muted-foreground line-through" : "text-foreground"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
            {steps.length > 3 && (
              <div className="text-center text-xs text-muted-foreground pt-2">
                + {steps.length - 3} meer stappen
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // 4. Casa Hörnig: Room Grid
  if (goal.category === 'casa') {
    const metadata = goal.metadata as any;
    const checklist = (metadata?.items || []) as { label: string; completed: boolean }[];
    const completedCount = checklist.filter(i => i.completed).length;
    const totalCount = checklist.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <motion.div 
        whileHover={{ y: -4 }}
        onClick={onClick}
        className="glass-card p-5 cursor-pointer flex flex-col items-center text-center h-[180px] justify-center relative group"
      >
         {/* Status Bar Top */}
         <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
            <div 
              className="h-full bg-orange-500 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
         </div>

         <div className="mb-3 text-4xl group-hover:scale-110 transition-transform duration-300">
           {goal.icon || "🏠"}
         </div>
         <h3 className="font-display font-bold text-lg mb-1">{goal.title}</h3>
         <span className={cn(
           "text-xs px-2 py-1 rounded-full font-medium",
           progress === 100 ? "bg-green-100 text-green-700" : "bg-orange-50 text-orange-600"
         )}>
           {completedCount}/{totalCount} tasks
         </span>
      </motion.div>
    );
  }

  // 5. Milestones: Timeline Card
  if (goal.category === 'milestones') {
    const isCompleted = (goal.currentValue || 0) >= (goal.targetValue || 1);
    
    return (
      <motion.div 
        whileHover={{ x: 4 }}
        onClick={onClick}
        className={cn(
          "glass-card p-6 cursor-pointer flex items-center gap-6",
          isCompleted ? "bg-yellow-50/50 border-yellow-200" : ""
        )}
      >
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0",
          isCompleted ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-400 grayscale"
        )}>
          {goal.icon || "🏆"}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-xl">{goal.title}</h3>
            {isCompleted && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">VOLTOOID</span>}
          </div>
          <p className="text-muted-foreground">{goal.unit || "Niet gestart"}</p>
        </div>

        <div className="text-slate-300">
           <ArrowRight className="w-6 h-6" />
        </div>
      </motion.div>
    );
  }

  // 6. Fun: Simple Counters
  if (goal.category === 'fun') {
    return (
      <motion.div 
        whileHover={{ rotate: 1 }}
        onClick={onClick}
        className="glass-card p-6 flex flex-col items-center justify-center text-center aspect-square cursor-pointer bg-gradient-to-br from-purple-50 to-white border-purple-100"
      >
        <span className="text-4xl mb-4">{goal.icon || "🎈"}</span>
        <h3 className="font-display font-bold text-lg text-slate-600 mb-2">{goal.title}</h3>
        <span className="text-5xl font-display font-black text-purple-600 tracking-tight">
          {goal.currentValue}
        </span>
        <span className="text-xs text-purple-400 mt-1 uppercase tracking-wider font-bold">
          {goal.unit}
        </span>
      </motion.div>
    );
  }

  // Default fallback
  return (
    <div className="p-4 bg-white rounded shadow" onClick={onClick}>
      {goal.title}
    </div>
  );
}
