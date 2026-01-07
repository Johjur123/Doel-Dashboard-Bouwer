import { useState } from "react";
import { useUsers } from "@/hooks/use-goals";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { motion } from "framer-motion";
import { Heart, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const avatarMappings: Record<string, string> = {
  "man": "M",
  "woman": "V",
  "person": "P",
  "heart": "H",
  "star": "S",
};

function getAvatarDisplay(avatar: string | null | undefined, name: string | undefined): string {
  if (!avatar || avatar === "") {
    return name?.charAt(0).toUpperCase() || "?";
  }
  if (avatarMappings[avatar]) {
    return avatarMappings[avatar];
  }
  return avatar.charAt(0).toUpperCase();
}

export function CouplesProfile() {
  const { data: users, isLoading } = useUsers();
  const [editOpen, setEditOpen] = useState(false);

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
    <>
      <motion.button
        onClick={() => setEditOpen(true)}
        className="flex items-center justify-center gap-3 group cursor-pointer relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        data-testid="button-edit-profiles"
      >
        <Avatar className="w-14 h-14 border-2 border-rose-200 dark:border-rose-800 transition-all group-hover:border-rose-400 dark:group-hover:border-rose-600">
          <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-lg font-semibold">
            {getAvatarDisplay(user1?.avatar, user1?.name)}
          </AvatarFallback>
        </Avatar>
        
        <motion.div 
          className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center relative"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 transition-opacity group-hover:opacity-0" />
          <Pencil className="w-3 h-3 text-rose-500 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
        
        <Avatar className="w-14 h-14 border-2 border-rose-200 dark:border-rose-800 transition-all group-hover:border-rose-400 dark:group-hover:border-rose-600">
          <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-lg font-semibold">
            {getAvatarDisplay(user2?.avatar, user2?.name)}
          </AvatarFallback>
        </Avatar>

        <span className="absolute -bottom-5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Klik om te bewerken
        </span>
      </motion.button>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
