import { useState } from "react";
import { useIdeaCategories, useIdeas, useCreateIdea, useCreateIdeaCategory, useDeleteIdeaCategory } from "@/hooks/use-ideas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lightbulb, Plus, Mail, ChevronRight, Folder, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const categoryColors = [
  { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
];

export function IdeasBox() {
  const { data: categories, isLoading: categoriesLoading } = useIdeaCategories();
  const { data: allIdeas, isLoading: ideasLoading } = useIdeas();
  const createIdea = useCreateIdea();
  const createCategory = useCreateIdeaCategory();
  const deleteCategory = useDeleteIdeaCategory();
  
  const [quickInput, setQuickInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleQuickAdd = () => {
    if (!quickInput.trim() || !selectedCategory) return;
    
    createIdea.mutate({
      categoryId: selectedCategory,
      title: quickInput.trim(),
    }, {
      onSuccess: () => {
        setQuickInput("");
        setSelectedCategory(null);
      }
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createCategory.mutate({
      name: newCategoryName.trim(),
      icon: "folder",
      color: categoryColors[(categories?.length || 0) % categoryColors.length].text.replace("text-", ""),
    }, {
      onSuccess: () => {
        setNewCategoryName("");
      }
    });
  };

  const getColorForIndex = (idx: number) => categoryColors[idx % categoryColors.length];
  
  const totalIdeas = allIdeas?.length || 0;
  const uncheckedIdeas = allIdeas?.filter(i => !i.completed).length || 0;

  if (categoriesLoading || ideasLoading) {
    return (
      <Card className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-cyan-500" />
          </div>
          <h3 className="font-semibold">Ideeënbus</h3>
        </div>
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-5" data-testid="card-ideas-box">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-cyan-500" />
          </div>
          <h3 className="font-semibold">Ideeënbus</h3>
          {totalIdeas > 0 && (
            <Badge variant="secondary" className="text-xs">
              {uncheckedIdeas} nieuw
            </Badge>
          )}
        </div>
        <Link href="/ideas">
          <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="button-view-all-ideas">
            Bekijk alles
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {categories?.map((cat, idx) => {
              const colors = getColorForIndex(idx);
              const ideaCount = allIdeas?.filter(i => i.categoryId === cat.id && !i.completed).length || 0;
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge 
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all",
                      colors.bg, colors.border,
                      selectedCategory === cat.id && "ring-2 ring-offset-2 ring-offset-background ring-cyan-500"
                    )}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    data-testid={`badge-category-${cat.id}`}
                  >
                    <Folder className={cn("w-3 h-3 mr-1", colors.text)} />
                    {cat.name}
                    {ideaCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-background/80">
                        {ideaCount}
                      </span>
                    )}
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Badge 
                variant="outline" 
                className="cursor-pointer border-dashed"
                data-testid="button-add-category"
              >
                <Plus className="w-3 h-3 mr-1" />
                Nieuw
              </Badge>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nieuwe categorie toevoegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Bijv. Restaurants Rotterdam"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCategory();
                  }}
                  data-testid="input-new-category-name"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button 
                    onClick={() => {
                      handleAddCategory();
                      setDialogOpen(false);
                    }}
                    disabled={!newCategoryName.trim() || createCategory.isPending}
                    data-testid="button-confirm-add-category"
                  >
                    Toevoegen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Typ je idee..."
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleQuickAdd();
                    if (e.key === "Escape") setSelectedCategory(null);
                  }}
                  className="flex-1"
                  autoFocus
                  data-testid="input-quick-idea"
                />
                <Button 
                  onClick={handleQuickAdd}
                  disabled={!quickInput.trim() || createIdea.isPending}
                  data-testid="button-add-idea"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedCategory(null)}
                  data-testid="button-cancel-idea"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedCategory && categories && categories.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">
            Maak een categorie aan om ideeën te verzamelen
          </p>
        )}

        {!selectedCategory && categories && categories.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Selecteer een categorie om snel een idee toe te voegen
          </p>
        )}
      </div>
    </Card>
  );
}
