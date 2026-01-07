import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <motion.h1 
            className="text-xl md:text-2xl font-display font-bold gradient-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Goal Dashboard
          </motion.h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <motion.div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg shadow-md border-2 border-background"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                title="Partner 1"
              >
                👨
              </motion.div>
              <motion.div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-lg shadow-md border-2 border-background -ml-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                title="Partner 2"
              >
                👩
              </motion.div>
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
