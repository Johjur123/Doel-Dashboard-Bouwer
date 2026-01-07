import { useUsers } from "@/hooks/use-goals";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { Moon, Sun, Flame, Zap } from "lucide-react";
import { calculateLevel } from "@shared/schema";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: users } = useUsers();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const totalXp = users?.reduce((sum, u) => sum + (u.xp || 0), 0) || 0;
  const maxStreak = Math.max(...(users?.map(u => u.currentStreak || 0) || [0]));
  const levelInfo = calculateLevel(totalXp);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.h1 
              className="text-xl md:text-2xl font-display font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Goal Dashboard
            </motion.h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {maxStreak > 0 && (
              <motion.div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <Flame className="w-4 h-4 streak-fire" />
                <span className="font-bold text-sm">{maxStreak}</span>
              </motion.div>
            )}

            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            >
              <div className="level-badge text-xs">{levelInfo.level}</div>
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">{totalXp} XP</span>
                </div>
                <div className="xp-bar w-16">
                  <div 
                    className="xp-bar-fill" 
                    style={{ width: `${levelInfo.progress}%` }} 
                  />
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-1">
              {users?.slice(0, 2).map((user, i) => (
                <motion.div
                  key={user.id}
                  className={cn(
                    "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shadow-md border-2 border-background",
                    i === 0 ? "from-blue-400 to-blue-600" : "from-pink-400 to-pink-600",
                    i === 1 && "-ml-3"
                  )}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 + i * 0.1 }}
                  title={user.name}
                >
                  {user.avatar || "👤"}
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-theme-toggle"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
