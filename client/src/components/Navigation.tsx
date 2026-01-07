import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Wallet, 
  Briefcase, 
  Home, 
  Trophy, 
  Sparkles,
  ChevronRight
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "lifestyle", label: "Lifestyle", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", gradient: "from-rose-500 to-pink-500" },
  { id: "savings", label: "Sparen", icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10", gradient: "from-emerald-500 to-teal-500" },
  { id: "business", label: "Business", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500 to-indigo-500" },
  { id: "casa", label: "Casa Hörnig", icon: Home, color: "text-orange-500", bg: "bg-orange-500/10", gradient: "from-orange-500 to-amber-500" },
  { id: "milestones", label: "Mijlpalen", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", gradient: "from-yellow-500 to-orange-500" },
  { id: "fun", label: "Fun", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", gradient: "from-purple-500 to-pink-500" },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="overflow-x-auto hide-scrollbar py-2">
      <div className="flex space-x-2 px-4 md:justify-center min-w-max mx-auto max-w-7xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 outline-none",
                isActive 
                  ? "text-white shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              whileHover={{ scale: isActive ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid={`tab-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r shadow-lg",
                    tab.gradient
                  )}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2 font-medium">
                <Icon 
                  className={cn("w-5 h-5", isActive ? "text-white" : tab.color)} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                <span className={cn(
                  "hidden md:block text-sm",
                  isActive && "font-semibold"
                )}>
                  {tab.label}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

export function getCategoryInfo(category: string) {
  return tabs.find(t => t.id === category) || tabs[0];
}
