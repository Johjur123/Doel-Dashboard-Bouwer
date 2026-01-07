import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Wallet, 
  Briefcase, 
  Home, 
  Trophy, 
  Smile 
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "lifestyle", label: "Lifestyle", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "savings", label: "Sparen", icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "business", label: "Business", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "casa", label: "Casa Hörnig", icon: Home, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "milestones", label: "Mijlpalen", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "fun", label: "Fun", icon: Smile, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 pb-2 pt-4 px-4 overflow-x-auto hide-scrollbar">
      <div className="flex space-x-2 md:justify-center min-w-max mx-auto max-w-7xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 outline-none",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80 hover:bg-muted/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={cn("absolute inset-0 rounded-2xl", tab.bg)}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2 font-medium">
                <Icon className={cn("w-5 h-5", isActive ? tab.color : "opacity-70")} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn("hidden md:block", isActive && "font-bold")}>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
