import { useEffect, useState, useRef, useCallback } from "react";
import { useUsers, useUpdateUser } from "@/hooks/use-goals";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, X, User, Heart, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const avatarIcons = [
  { value: "", label: "Letter", icon: null },
  { value: "user", label: "Gebruiker", icon: User },
  { value: "heart", label: "Hart", icon: Heart },
  { value: "star", label: "Ster", icon: Star },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
];

function getAvatarDisplay(avatar: string | null | undefined, name: string | undefined): { type: "letter" | "icon"; value: string | typeof User } {
  if (!avatar || avatar === "") {
    return { type: "letter", value: name?.charAt(0).toUpperCase() || "?" };
  }
  
  if (avatar.startsWith("data:") || avatar.startsWith("http")) {
    return { type: "letter", value: name?.charAt(0).toUpperCase() || "?" };
  }
  
  const found = avatarIcons.find(e => e.value === avatar);
  if (found && found.icon) {
    return { type: "icon", value: found.icon };
  }
  
  return { type: "letter", value: name?.charAt(0).toUpperCase() || "?" };
}

function isImageUrl(avatar: string | null | undefined): boolean {
  return !!avatar && (avatar.startsWith("data:") || avatar.startsWith("http"));
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const user1 = users?.[0];
  const user2 = users?.[1];

  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [avatar1, setAvatar1] = useState("");
  const [avatar2, setAvatar2] = useState("");
  
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && users) {
      setName1(user1?.name || "");
      setName2(user2?.name || "");
      setAvatar1(user1?.avatar || "");
      setAvatar2(user2?.avatar || "");
    }
  }, [open, users, user1?.name, user2?.name, user1?.avatar, user2?.avatar]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, setAvatar: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ongeldig bestand",
        description: "Selecteer een afbeelding (JPG, PNG, GIF)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "Maximale grootte is 2MB",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatar(result);
      if (event.target) {
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleSave = async () => {
    try {
      const promises = [];
      
      if (user1 && (name1.trim() !== user1.name || avatar1 !== (user1.avatar || ""))) {
        promises.push(updateUser.mutateAsync({ 
          id: user1.id, 
          name: name1.trim(),
          avatar: avatar1 || null,
        }));
      }
      if (user2 && (name2.trim() !== user2.name || avatar2 !== (user2.avatar || ""))) {
        promises.push(updateUser.mutateAsync({ 
          id: user2.id, 
          name: name2.trim(),
          avatar: avatar2 || null,
        }));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        toast({
          title: "Profielen bijgewerkt",
          description: "Jullie profielen zijn opgeslagen",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon profielen niet bijwerken",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderAvatarPreview = (avatar: string, name: string, inputRef: React.RefObject<HTMLInputElement | null>, setAvatar: (value: string) => void) => {
    const display = getAvatarDisplay(avatar, name);
    const hasImage = isImageUrl(avatar);
    
    return (
      <div className="relative group">
        <Avatar className="w-20 h-20 border-2 border-rose-200 dark:border-rose-800 transition-all">
          {hasImage ? (
            <AvatarImage src={avatar} alt={name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-2xl font-semibold">
            {display.type === "letter" ? (
              display.value as string
            ) : (
              (() => {
                const IconComponent = display.value as typeof User;
                return <IconComponent className="w-8 h-8" />;
              })()
            )}
          </AvatarFallback>
        </Avatar>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
          data-testid="button-upload-avatar"
        >
          <Camera className="w-3.5 h-3.5" />
        </motion.button>
        
        {hasImage && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAvatar("")}
            className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg"
            data-testid="button-remove-avatar"
          >
            <X className="w-3 h-3" />
          </motion.button>
        )}
      </div>
    );
  };

  const renderAvatarOptions = (currentAvatar: string, setAvatar: (value: string) => void, name: string, testIdPrefix: string) => (
    <div className="flex gap-2 mt-2 flex-wrap">
      {avatarIcons.map((option) => {
        const isSelected = currentAvatar === option.value;
        return (
          <motion.button
            key={option.value || "none"}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAvatar(option.value)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300",
              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            data-testid={`button-${testIdPrefix}-${option.value || 'none'}`}
          >
            {option.icon ? (
              <option.icon className="w-4 h-4" />
            ) : (
              name?.charAt(0).toUpperCase() || "?"
            )}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Profielen bewerken</DialogTitle>
          <DialogDescription>
            Pas jullie namen en profielfoto's aan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {renderAvatarPreview(avatar1, name1, fileInput1Ref, setAvatar1)}
              <input
                ref={fileInput1Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, setAvatar1)}
                data-testid="input-file-avatar1"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="name1">Partner 1</Label>
                <Input
                  id="name1"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="Naam"
                  data-testid="input-name-1"
                />
                <div>
                  <Label className="text-xs text-muted-foreground">Of kies een icoon</Label>
                  {renderAvatarOptions(avatar1, setAvatar1, name1, "avatar1")}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start gap-4">
              {renderAvatarPreview(avatar2, name2, fileInput2Ref, setAvatar2)}
              <input
                ref={fileInput2Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, setAvatar2)}
                data-testid="input-file-avatar2"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="name2">Partner 2</Label>
                <Input
                  id="name2"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="Naam"
                  data-testid="input-name-2"
                />
                <div>
                  <Label className="text-xs text-muted-foreground">Of kies een icoon</Label>
                  {renderAvatarOptions(avatar2, setAvatar2, name2, "avatar2")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-profile">
            Annuleren
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateUser.isPending || !name1.trim() || !name2.trim()}
            data-testid="button-save-profile"
          >
            {updateUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Opslaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
