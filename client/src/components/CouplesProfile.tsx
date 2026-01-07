import { useUsers } from "@/hooks/use-goals";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CouplesProfile() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  const user1 = users?.[0];
  const user2 = users?.[1];

  return (
    <motion.div 
      className="flex items-center justify-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Avatar className="w-14 h-14 border-2 border-rose-200 dark:border-rose-800">
        <AvatarImage src={user1?.avatar || undefined} alt={user1?.name || "Partner 1"} />
        <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-lg font-semibold">
          {user1?.name?.charAt(0) || "J"}
        </AvatarFallback>
      </Avatar>
      
      <motion.div 
        className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
      </motion.div>
      
      <Avatar className="w-14 h-14 border-2 border-rose-200 dark:border-rose-800">
        <AvatarImage src={user2?.avatar || undefined} alt={user2?.name || "Partner 2"} />
        <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-lg font-semibold">
          {user2?.name?.charAt(0) || "L"}
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );
}
