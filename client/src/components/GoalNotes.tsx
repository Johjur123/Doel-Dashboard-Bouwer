import { useState } from "react";
import { useGoalNotes, useCreateGoalNote, useDeleteGoalNote, useUsers } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface GoalNotesProps {
  goalId: number;
}

export function GoalNotes({ goalId }: GoalNotesProps) {
  const [newNote, setNewNote] = useState("");
  const { data: notes, isLoading } = useGoalNotes(goalId);
  const { data: users } = useUsers();
  const createNote = useCreateGoalNote();
  const deleteNote = useDeleteGoalNote();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!newNote.trim()) return;
    createNote.mutate({
      goalId,
      userId: 1,
      content: newNote.trim(),
    }, {
      onSuccess: () => {
        setNewNote("");
        toast({ title: "Notitie toegevoegd" });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon notitie niet toevoegen", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteNote.mutate({ id, goalId }, {
      onSuccess: () => {
        toast({ title: "Notitie verwijderd" });
      },
      onError: () => {
        toast({ title: "Fout", description: "Kon notitie niet verwijderen", variant: "destructive" });
      }
    });
  };

  const getUser = (userId: number) => users?.find(u => u.id === userId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <span>Notities</span>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Voeg een notitie toe..."
          className="resize-none text-sm min-h-[80px]"
          data-testid="input-note"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!newNote.trim() || createNote.isPending}
          data-testid="button-add-note"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <AnimatePresence>
        {notes && notes.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notes.map((note, idx) => {
              const user = getUser(note.userId);
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3 group"
                  data-testid={`note-item-${note.id}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-secondary">
                      {user?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{note.content}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => handleDelete(note.id)}
                        data-testid={`button-delete-note-${note.id}`}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{user?.name || "Onbekend"}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground">
                        {note.createdAt 
                          ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: nl })
                          : "zojuist"
                        }
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nog geen notities
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
