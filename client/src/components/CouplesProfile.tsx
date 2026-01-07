import { useState } from "react";
import { useUsers } from "@/hooks/use-goals";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { motion } from "framer-motion";
import { Heart, Pencil, User, Star, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const avatarIconMap: Record<string, typeof User> = {
  "user": User,
  "heart": Heart,
  "star": Star,
  "sparkles": Sparkles,
};

function isImageUrl(avatar: string | null | undefined): boolean {
  return !!avatar && (avatar.startsWith("data:") || avatar.startsWith("http"));
}

function getAvatarDisplay(avatar: string | null | undefined, name: string | undefined): { type: "letter" | "icon" | "image"; value: string | typeof User } {
  if (!avatar || avatar === "") {
    return { type: "letter", value: name?.charAt(0).toUpperCase() || "?" };
  }
  
  if (isImageUrl(avatar)) {
    return { type: "image", value: avatar };
  }
  
  const IconComponent = avatarIconMap[avatar];
  if (IconComponent) {
    return { type: "icon", value: IconComponent };
  }
  
  return { type: "letter", value: name?.charAt(0).toUpperCase() || "?" };
}

interface ProfileAvatarProps {
  avatar: string | null | undefined;
  name: string | undefined;
  className?: string;
}

function ProfileAvatar({ avatar, name, className }: ProfileAvatarProps) {
  const display = getAvatarDisplay(avatar, name);
  
  return (
    <Avatar className={cn("border-2 border-rose-200 dark:border-rose-800 transition-all", className)}>
      {display.type === "image" ? (
        <AvatarImage src={display.value as string} alt={name || "Avatar"} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 font-semibold">
        {display.type === "letter" ? (
          <span className="text-lg">{display.value as string}</span>
        ) : display.type === "icon" ? (
          (() => {
            const IconComponent = display.value as typeof User;
            return <IconComponent className="w-6 h-6" />;
          })()
        ) : null}
      </AvatarFallback>
    </Avatar>
  );
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
        whileHover={{ scale: 1.02 }}
        data-testid="button-edit-profiles"
      >
        <motion.div
          whileHover={{ rotate: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ProfileAvatar 
            avatar={user1?.avatar} 
            name={user1?.name} 
            className="w-14 h-14 group-hover:border-rose-400 dark:group-hover:border-rose-600"
          />
        </motion.div>
        
        <motion.div 
          className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center relative"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500 transition-opacity group-hover:opacity-0" />
          <Pencil className="w-4 h-4 text-rose-500 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
        
        <motion.div
          whileHover={{ rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ProfileAvatar 
            avatar={user2?.avatar} 
            name={user2?.name} 
            className="w-14 h-14 group-hover:border-rose-400 dark:group-hover:border-rose-600"
          />
        </motion.div>

        <motion.span 
          className="absolute -bottom-6 text-xs text-muted-foreground whitespace-nowrap"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          Klik om te bewerken
        </motion.span>
      </motion.button>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
