import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Goal } from "@shared/schema";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableGoalsProps {
  goals: Goal[];
  onReorder: (goals: Goal[]) => void;
  renderGoal: (goal: Goal, index: number, dragHandle: React.ReactNode) => React.ReactNode;
  gridLayout?: boolean;
}

export function SortableGoals({ goals, onReorder, renderGoal, gridLayout = false }: SortableGoalsProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex((g) => g.id === active.id);
      const newIndex = goals.findIndex((g) => g.id === over.id);
      const newOrder = arrayMove(goals, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const activeGoal = activeId ? goals.find((g) => g.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={goals.map((g) => g.id)}
        strategy={gridLayout ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {goals.map((goal, index) => (
          <SortableGoalItem 
            key={goal.id} 
            goal={goal} 
            index={index}
            renderGoal={renderGoal}
            isActive={activeId === goal.id}
          />
        ))}
      </SortableContext>
      
      <DragOverlay>
        {activeGoal && (
          <div className="opacity-90 scale-105 shadow-2xl">
            {renderGoal(activeGoal, 0, <DragHandle />)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableGoalItemProps {
  goal: Goal;
  index: number;
  renderGoal: (goal: Goal, index: number, dragHandle: React.ReactNode) => React.ReactNode;
  isActive: boolean;
}

function SortableGoalItem({ goal, index, renderGoal, isActive }: SortableGoalItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  const dragHandle = (
    <button
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none p-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/80 transition-colors cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing"
      )}
      data-testid={`drag-handle-${goal.id}`}
    >
      <GripVertical className="w-4 h-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-50",
        isActive && "z-50"
      )}
    >
      <AnimatePresence>
        {!isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {renderGoal(goal, index, dragHandle)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DragHandle() {
  return (
    <div className="p-1.5 rounded-lg text-muted-foreground bg-secondary/80 cursor-grabbing">
      <GripVertical className="w-4 h-4" />
    </div>
  );
}
