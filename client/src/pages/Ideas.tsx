import { useState } from "react";
import { useIdeaCategories, useIdeas, useCreateIdea, useUpdateIdea, useDeleteIdea, useCreateIdeaCategory, useDeleteIdeaCategory, useUpdateIdeaCategory } from "@/hooks/use-ideas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Lightbulb, 
  Plus, 
  ArrowLeft, 
  Folder, 
  Trash2, 
  MoreVertical,
  Check,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Idea, IdeaCategory } from "@shared/schema";

const categoryColors = [
  { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20", gradient: "from-rose-500 to-pink-500" },
  { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", gradient: "from-blue-500 to-indigo-500" },
  { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", gradient: "from-emerald-500 to-teal-500" },
  { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20", gradient: "from-purple-500 to-violet-500" },
  { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", gradient: "from-amber-500 to-orange-500" },
  { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20", gradient: "from-cyan-500 to-blue-500" },
];

export default function Ideas() {
  const { data: categories, isLoading: categoriesLoading } = useIdeaCategories();
  const { data: allIdeas, isLoading: ideasLoading } = useIdeas();
  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();
  const createCategory = useCreateIdeaCategory();
  const deleteCategory = useDeleteIdeaCategory();
  const updateCategory = useUpdateIdeaCategory();
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newIdeaInputs, setNewIdeaInputs] = useState<Record<number, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createCategory.mutate({
      name: newCategoryName.trim(),
      icon: "folder",
      color: categoryColors[(categories?.length || 0) % categoryColors.length].text.replace("text-", ""),
    }, {
      onSuccess: () => {
        setNewCategoryName("");
        setDialogOpen(false);
      }
    });
  };

  const handleAddIdea = (categoryId: number) => {
    const input = newIdeaInputs[categoryId];
    if (!input?.trim()) return;
    
    createIdea.mutate({
      categoryId,
      title: input.trim(),
    }, {
      onSuccess: () => {
        setNewIdeaInputs(prev => ({ ...prev, [categoryId]: "" }));
      }
    });
  };

  const handleToggleIdea = (idea: Idea) => {
    updateIdea.mutate({
      id: idea.id,
      data: { completed: !idea.completed },
    });
  };

  const handleDeleteIdea = (id: number) => {
    deleteIdea.mutate(id);
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategory.mutate(id);
  };

  const handleStartEditCategory = (cat: IdeaCategory) => {
    setEditingCategory(cat.id);
    setEditCategoryName(cat.name);
  };

  const handleSaveEditCategory = (id: number) => {
    if (!editCategoryName.trim()) return;
    updateCategory.mutate({
      id,
      data: { name: editCategoryName.trim() },
    }, {
      onSuccess: () => {
        setEditingCategory(null);
        setEditCategoryName("");
      }
    });
  };

  const getColorForIndex = (idx: number) => categoryColors[idx % categoryColors.length];

  const isLoading = categoriesLoading || ideasLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
              <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="grid gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6 gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-cyan-500" />
              </div>
              <h1 className="text-display-sm">Ideeënbus</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-category">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe categorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nieuwe categorie toevoegen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Bijv. Restaurants Rotterdam, Samen doen..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCategory();
                    }}
                    data-testid="input-new-category"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuleren
                    </Button>
                    <Button 
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim() || createCategory.isPending}
                      data-testid="button-create-category"
                    >
                      Toevoegen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <ThemeToggle />
          </div>
        </header>

        {categories && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-cyan-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nog geen categorieën</h2>
            <p className="text-muted-foreground mb-6">
              Maak je eerste categorie aan om ideeën te verzamelen
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-category">
              <Plus className="w-4 h-4 mr-2" />
              Eerste categorie maken
            </Button>
          </motion.div>
        )}

        <div className="grid gap-4">
          <AnimatePresence>
            {categories?.map((cat, idx) => {
              const colors = getColorForIndex(idx);
              const categoryIdeas = allIdeas?.filter(i => i.categoryId === cat.id) || [];
              const completedCount = categoryIdeas.filter(i => i.completed).length;
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="glass-card overflow-hidden" data-testid={`card-category-${cat.id}`}>
                    <div className={cn("h-1 bg-gradient-to-r", colors.gradient)} />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
                            <Folder className={cn("w-5 h-5", colors.text)} />
                          </div>
                          {editingCategory === cat.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEditCategory(cat.id);
                                  if (e.key === "Escape") setEditingCategory(null);
                                }}
                                autoFocus
                                className="flex-1"
                                data-testid={`input-edit-category-${cat.id}`}
                              />
                              <Button 
                                size="icon" 
                                onClick={() => handleSaveEditCategory(cat.id)}
                                data-testid={`button-save-category-${cat.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{cat.name}</h3>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {completedCount}/{categoryIdeas.length}
                              </Badge>
                            </div>
                          )}
                        </div>
                        {editingCategory !== cat.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-menu-category-${cat.id}`}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStartEditCategory(cat)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Bewerken
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <div className="space-y-2">
                        <AnimatePresence>
                          {categoryIdeas.map((idea) => (
                            <motion.div
                              key={idea.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="group flex items-center gap-3 p-2 rounded-lg hover-elevate"
                              data-testid={`idea-item-${idea.id}`}
                            >
                              <Checkbox
                                checked={idea.completed ?? false}
                                onCheckedChange={() => handleToggleIdea(idea)}
                                data-testid={`checkbox-idea-${idea.id}`}
                              />
                              <span className={cn(
                                "flex-1 text-sm transition-all",
                                idea.completed && "line-through text-muted-foreground"
                              )}>
                                {idea.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                                onClick={() => handleDeleteIdea(idea.id)}
                                data-testid={`button-delete-idea-${idea.id}`}
                              >
                                <Trash2 className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <div className="flex gap-2 pt-2">
                          <Input
                            placeholder="Nieuw idee toevoegen..."
                            value={newIdeaInputs[cat.id] || ""}
                            onChange={(e) => setNewIdeaInputs(prev => ({ 
                              ...prev, 
                              [cat.id]: e.target.value 
                            }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddIdea(cat.id);
                            }}
                            className="flex-1"
                            data-testid={`input-new-idea-${cat.id}`}
                          />
                          <Button 
                            onClick={() => handleAddIdea(cat.id)}
                            disabled={!newIdeaInputs[cat.id]?.trim() || createIdea.isPending}
                            data-testid={`button-add-idea-${cat.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
