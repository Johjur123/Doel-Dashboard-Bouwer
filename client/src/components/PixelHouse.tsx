import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PixelHouseProps {
  progress: number;
  activeRoom?: string;
  className?: string;
}

export function PixelHouse({ progress, activeRoom, className }: PixelHouseProps) {
  const stage = Math.min(Math.floor(progress / 20), 5);
  
  return (
    <div className={cn("relative", className)}>
      <svg 
        viewBox="0 0 64 64" 
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      >
        <rect x="8" y="48" width="48" height="16" fill="hsl(var(--secondary))" />
        
        {stage >= 1 && (
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <rect x="12" y="32" width="40" height="16" fill="hsl(142 40% 40%)" className="dark:fill-emerald-700" />
            <rect x="12" y="32" width="40" height="2" fill="hsl(142 40% 30%)" className="dark:fill-emerald-800" />
          </motion.g>
        )}
        
        {stage >= 2 && (
          <motion.g
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <polygon points="32,12 8,32 56,32" fill="hsl(25 80% 45%)" className="dark:fill-orange-700" />
            <polygon points="32,12 8,32 32,32" fill="hsl(25 80% 35%)" className="dark:fill-orange-800" />
          </motion.g>
        )}
        
        {stage >= 3 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <rect x="26" y="38" width="12" height="10" fill="hsl(25 60% 30%)" className="dark:fill-amber-900" />
            <rect x="30" y="42" width="2" height="4" fill="hsl(45 90% 50%)" className="dark:fill-yellow-500" />
          </motion.g>
        )}
        
        {stage >= 4 && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <rect x="16" y="36" width="6" height="6" fill="hsl(200 80% 70%)" className="dark:fill-sky-400" />
            <rect x="16" y="36" width="6" height="1" fill="hsl(200 80% 50%)" className="dark:fill-sky-600" />
            <line x1="19" y1="36" x2="19" y2="42" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.3" />
            <line x1="16" y1="39" x2="22" y2="39" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.3" />
            
            <rect x="42" y="36" width="6" height="6" fill="hsl(200 80% 70%)" className="dark:fill-sky-400" />
            <rect x="42" y="36" width="6" height="1" fill="hsl(200 80% 50%)" className="dark:fill-sky-600" />
            <line x1="45" y1="36" x2="45" y2="42" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.3" />
            <line x1="42" y1="39" x2="48" y2="39" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.3" />
          </motion.g>
        )}
        
        {stage >= 5 && (
          <motion.g
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <rect x="28" y="16" width="8" height="8" fill="hsl(0 70% 50%)" className="dark:fill-red-600" />
            <rect x="31" y="10" width="2" height="6" fill="hsl(var(--muted-foreground))" />
            
            <motion.circle 
              cx="54" cy="18" r="4" 
              fill="hsl(45 90% 60%)" 
              className="dark:fill-yellow-400"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            
            <circle cx="10" cy="56" r="3" fill="hsl(142 50% 50%)" className="dark:fill-green-500" />
            <circle cx="54" cy="56" r="3" fill="hsl(142 50% 50%)" className="dark:fill-green-500" />
            <circle cx="6" cy="54" r="2" fill="hsl(142 40% 40%)" className="dark:fill-green-600" />
            <circle cx="58" cy="54" r="2" fill="hsl(142 40% 40%)" className="dark:fill-green-600" />
          </motion.g>
        )}
        
        {activeRoom && (
          <motion.rect
            x={activeRoom === "woonkamer" ? 14 : activeRoom === "keuken" ? 40 : 26}
            y={activeRoom === "tuin" ? 50 : 34}
            width={activeRoom === "tuin" ? 12 : 10}
            height={activeRoom === "tuin" ? 8 : 12}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </svg>
      
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
          {Math.round(progress)}% af
        </span>
      </div>
    </div>
  );
}
