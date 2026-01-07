import { useEffect, useState } from "react";
import { useUsers, useUpdateUser } from "@/hooks/use-goals";
import { useToast } from "@/hooks/use-toast";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const avatarEmojis = [
  { value: "", label: "Letter", display: null },
  { value: "man", label: "Man", display: "M" },
  { value: "woman", label: "Vrouw", display: "V" },
  { value: "person", label: "Persoon", display: "P" },
  { value: "heart", label: "Hart", display: "H" },
  { value: "star", label: "Ster", display: "S" },
];

function getAvatarDisplay(avatar: string | null | undefined, name: string | undefined): string {
  if (!avatar || avatar === "") {
    return name?.charAt(0).toUpperCase() || "?";
  }
  const found = avatarEmojis.find(e => e.value === avatar);
  if (found && found.display) {
    return found.display;
  }
  return avatar.charAt(0).toUpperCase();
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

  useEffect(() => {
    if (open && users) {
      setName1(user1?.name || "");
      setName2(user2?.name || "");
      setAvatar1(user1?.avatar || "");
      setAvatar2(user2?.avatar || "");
    }
  }, [open, users, user1?.name, user2?.name, user1?.avatar, user2?.avatar]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profielen bewerken</DialogTitle>
          <DialogDescription>
            Pas jullie namen en avatars aan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-rose-200 dark:border-rose-800">
                <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-lg font-semibold">
                  {getAvatarDisplay(avatar1, name1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="name1">Partner 1</Label>
                <Input
                  id="name1"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="Naam"
                  data-testid="input-name-1"
                />
              </div>
            </div>
            <div className="pl-1">
              <Label className="text-xs text-muted-foreground">Avatar</Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {avatarEmojis.map((option) => (
                  <button
                    key={option.value || "none"}
                    type="button"
                    onClick={() => setAvatar1(option.value)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300",
                      avatar1 === option.value
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-105"
                    )}
                    data-testid={`button-avatar1-${option.value || 'none'}`}
                  >
                    {option.display || name1?.charAt(0).toUpperCase() || "?"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-rose-200 dark:border-rose-800">
                <AvatarFallback className="bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 text-lg font-semibold">
                  {getAvatarDisplay(avatar2, name2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="name2">Partner 2</Label>
                <Input
                  id="name2"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="Naam"
                  data-testid="input-name-2"
                />
              </div>
            </div>
            <div className="pl-1">
              <Label className="text-xs text-muted-foreground">Avatar</Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {avatarEmojis.map((option) => (
                  <button
                    key={option.value || "none"}
                    type="button"
                    onClick={() => setAvatar2(option.value)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300",
                      avatar2 === option.value
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-105"
                    )}
                    data-testid={`button-avatar2-${option.value || 'none'}`}
                  >
                    {option.display || name2?.charAt(0).toUpperCase() || "?"}
                  </button>
                ))}
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
